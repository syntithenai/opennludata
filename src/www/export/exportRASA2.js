import { replaceEntitiesWithValues, uniquifyArray, snakeToCamelCase, camelToSnakeCase, toSnakeCase} from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'
import RASATemplates from './RASATemplates'
import {exportJSON} from './exportJSON'
const yaml = require('js-yaml');

function generateFolderTree(rulesContent, storiesContent, nluContent, responsesContent, formsContent, fileLookups, actionsContent, configContent, domainContent, credentialsContent, endpointsContent, actionFiles) {
    var folderTree = {
        files:[
            {name:'actions.py',content:actionsContent},
            {name:'config.yml',content:configContent},
            {name:'domain.yml',content:domainContent},
            {name:'forms.yml',content:formsContent},
           // {name:'responses.yml',content:responsesContent},
            {name:'credentials.yml',content:credentialsContent},
            {name:'endpoints.yml',content:endpointsContent}
        ], 
        folders:[
            {name:'actions', files:actionFiles}, 
            {name:'data', 
                files:[{name:'nlu.yml', content: nluContent},{name:'rules.yml', content: rulesContent},{name:'stories.yml', content: storiesContent}],
            }
        ]
    }
    //console.log(['TREE GEN',folderTree])
    return folderTree
}

function replaceEntitiesWithJSON(example,entities,synonymLookups) {
    //console.log(['REPLACE',example,entities,synonymLookups])
    // replace entity values with {entityName}
    // first sort entities by start key
    if (example && Array.isArray(entities)) {
        entities = entities.sort(function(a,b) {
          if (a.start < b.start) return -1
          else return 1  
        })
        var offset = 0
        var newExample = example
        entities.map(function(entity) {
            if (entity.type) {
                var replacementMeta = {entity: entity.type}
                if (synonymLookups[entity.value] && synonymLookups[entity.value].trim()) {
                    replacementMeta.value = synonymLookups[entity.value]
                }
                var replacement = '['+entity.value+']'+JSON.stringify(replacementMeta)
                newExample = newExample.slice(0,entity.start + offset)+replacement+newExample.slice(entity.end + offset)
                var diff = (entity.end - entity.start) - (replacement.length)
                offset -= diff
            }
            return null
        })
        return newExample
    } else {
        return example
    }
}


function exportRASA(skill) {

    return new Promise(function(resolve,reject) {
         
        exportJSON(skill).then(function(json) {
            //console.log(['EXP RASA ',skill])
            // COMMON EXAMPLES  
            // ENTITY LOOKUPS AND CACHE SYNONYMS
            var synonymLookups = {}
            var synonyms = {}
            var entityLookups = {}
            Object.keys(skill.entities).map(function(entityKey) {
                if (skill.entities[entityKey] && Array.isArray(skill.entities[entityKey].values)) {
                    skill.entities[entityKey].values.map(function(value) {
                        entityLookups[entityKey] = Array.isArray(entityLookups[entityKey]) ? entityLookups[entityKey] : []
                        entityLookups[entityKey].push(value)
                        return null
                    })
                }
                if (skill.entities[entityKey] && Array.isArray(skill.entities[entityKey].lists)) {
                    skill.entities[entityKey].lists.map(function(list) {
                        if (list && skill.entitiesData && Array.isArray(skill.entitiesData[list])) {
                            skill.entitiesData[list].map(function(entityData) {
                                if (entityData.value && entityData.value.trim()) {
                                    entityLookups[entityKey] = Array.isArray(entityLookups[entityKey]) ? entityLookups[entityKey] : []
                                    entityLookups[entityKey].push(entityData.value)
                                    if (entityData.synonym && entityData.synonym.trim()) {
                                        synonymLookups[entityData.value] = entityData.synonym
                                        synonyms[entityData.synonym] = Array.isArray(synonyms[entityData.synonym]) ? synonyms[entityData.synonym] : []
                                        synonyms[entityData.synonym].push(entityData.value)
                                    }
                                }
                            })
                        }
                        return null
                    })
                }
            })
            //console.log(['ENTSYN',synonymLookups,entityLookups])
            // COMMON EXAMPLES  
            var nluOut=['version: "2.0"', "",'nlu:']
            if (skill.intents) {
                var collatedExamples = {}
                //console.log(['have intents',skill.intents])
                Object.keys(skill.intents).map(function(intentKey) {
                    const intentItem = skill.intents[intentKey]
                    collatedExamples[intentKey] = Array.isArray(collatedExamples[intentKey]) ? collatedExamples[intentKey] : []
                    //console.log([intentKey,intentItem])
                    if (Array.isArray(intentItem)) intentItem.map(function(item) {
                        collatedExamples[intentKey].push(replaceEntitiesWithJSON(item.example,item.entities,synonymLookups))
                    })
                    
                    return null
                })
                //console.log(['CE',collatedExamples])
                    
                Object.keys(collatedExamples).map(function(intentKey) {
                    nluOut.push('  - intent: '+intentKey)
                    nluOut.push('    examples: |')
                    uniquifyArray(collatedExamples[intentKey]).map(function(example) {
                        nluOut.push('      - '+example)
                        return null
                    })
                    return null
                })
                Object.keys(entityLookups).map(function(entityKey) {
                    nluOut.push('  - lookup: '+entityKey)
                    nluOut.push('    examples: |')
                    uniquifyArray(entityLookups[entityKey]).map(function(example) {
                        nluOut.push('      - '+example)
                        return null
                    })
                    return null
                })
                Object.keys(synonyms).map(function(synonymKey) {
                    nluOut.push('  - synonym: '+synonymKey)
                    nluOut.push('    examples: |')
                    uniquifyArray(synonyms[synonymKey]).map(function(example) {
                        nluOut.push('      - '+example)
                        return null
                    })
                    return null
                })
                nluOut.push("\n")
            }
            
            // REGEXPS
            var collatedRegexps = {}
            if (skill && skill.entities && Object.keys(skill.entities).length > 0) {
                console.log(['regexpexp rasa2',skill.entities])
                Object.keys(skill.entities).map(function(entityKey) {
                    var entity = skill.entities[entityKey]
                    console.log(['regexpexp rasa2 entity',entity])
                    if (entity && Array.isArray(entity.regexps)) {
                        entity.regexps.map(function(regexp,rkey) {
                            console.log(['regexpexp rasa2 regexp',regexp])
                            if (regexp && regexp.expression && regexp.expression.trim() ) {
                                collatedRegexps[entityKey] = Array.isArray(collatedRegexps[entityKey]) ? collatedRegexps[entityKey] : []
                                collatedRegexps[entityKey].push(regexp.expression)
                            }
                        })
                    }
                })
                Object.keys(collatedRegexps).map(function(key) {
                    nluOut.push("  - regex: "+key)
                    nluOut.push("    examples: |")
                    collatedRegexps[key].map(function(reg) {
                          nluOut.push("      - "+reg)
                    })
                })
            }
            
            var nluContent = nluOut.join("\n") //+"\n"+synonymsOut.join("\n")+lookups.join("\n")
            //console.log(['NLUC',nluContent])
            // CONSTANTS
            var configContent = skill && skill.rasa && skill.rasa.config && skill.rasa.config.trim() ?  skill.rasa.config : RASATemplates.config
            var credentialsContent = skill && skill.rasa && skill.rasa.credentials && skill.rasa.credentials.trim() ?  skill.rasa.credentials :  RASATemplates.credentials
            var endpointsContent = skill && skill.rasa && skill.rasa.endpoint && skill.rasa.endpoint.trim() ?  skill.rasa.endpoint : RASATemplates.endpoint
            var sessionContent = skill && skill.rasa && skill.rasa.session && skill.rasa.session.trim() ?  skill.rasa.session : RASATemplates.session
            
            // RASA ACTIONS
            var actionsContent = RASATemplates.actions
            var domainActions = []
            var domainContent = ''
            var fileLookups=[]
            
            var rulesContent = []
            var storiesContent = []
            var responsesContent = []
            var formsContent = []
            
            var actionFiles = []
            if (skill.actions) {
                Object.keys(skill.actions).map(function(action) {
                    if (action && action.trim().length > 0) {
                        domainActions.push(action.trim())
                        var string = snakeToCamelCase(toSnakeCase(camelToSnakeCase(action)))
                        var snake = camelToSnakeCase(string)+'_action'
                        var name = string && string.trim().length > 0 ? string[0].toUpperCase() + string.substring(1) : ''
                        actionFiles.push({name:name+'Action.py', content:RASATemplates.single_action(name+'Action',snake)})
                        actionsContent+="\n import "+name+'Action.py'
                    }
                    return null
                })
            }
            //console.log(['act',actionFiles,actionsContent])
            
            
           
            // FORMS
            var collatedForms = {}
            if (Object.keys(skill.forms).length > 0) {
                  Object.keys(skill.forms).map(function(formKey) {
                    var form = skill.forms[formKey]
                    domainActions.push(formKey)
                    if (form && Array.isArray(form.slots)) {
                        collatedForms[formKey] = {}
                        form.slots.map(function(slot) {
                            if (Array.isArray(slot.capturefrom)) collatedForms[formKey][slot.value] = slot.capturefrom.map(function(capture) {
                                var clean = {}
                                if (capture) {
                                    if (capture.type) clean.type = capture.type
                                    if (capture.entity) clean.entity = capture.entity
                                    if (capture.role) clean.role = capture.role
                                    if (capture.group) clean.group = capture.group
                                    if (capture.not_intent) clean.not_intent = capture.not_intent
                                    if (capture.value) clean.value = capture.value
                                }
                                return clean
                            })
                        })
                        
                    }
                    
                })
            }

            
            
            
                ////console.log(['action files',domainEntities, domainIntents, domainSlots, domainSlotsMeta])
            var domainEntities = skill.entities ? Object.keys(skill.entities) : []
            var domainIntents = skill.intents ? Object.keys(skill.intents) : []
            
            var domainSlots = skill.rasa && skill.rasa.slots ?  Object.keys(skill.rasa.slots) : (skill.entities ? Object.keys(skill.entities) : [])
            var domainSlotsMeta = {}
            domainSlots.map(function(slot) {
               domainSlotsMeta[slot] = {}
                
               domainSlotsMeta[slot].type = skill && skill.rasa && skill.rasa.slots && skill.rasa.slots[slot] &&  skill.rasa.slots[slot].slotType ? skill.rasa.slots[slot].slotType : 'text'
               domainSlotsMeta[slot].influence_conversation = 'false'
               if (false && skill && skill.rasa && skill.rasa.slots && skill.rasa.slots[slot] &&  skill.rasa.slots[slot].slotType && skill.rasa.slots[slot].slotType.trim() &&  skill.rasa.slots[slot].slotType !=="unfeaturized") {
                   domainSlotsMeta[slot].influence_conversation = 'true'
               }
               return null
            })
            //console.log(['DOMAIN',domainEntities, domainIntents, domainSlots, domainSlotsMeta])
            
            var domainContentParts=['version: "2.0"',""]
            if (domainIntents.length > 0) {
                domainContentParts.push("intents:")
                var grouped = {}
                var ungrouped = {}
                domainIntents.map(function(intent) {
                    var parts = intent.split("/")
                    if (parts.length > 1) {
                        grouped[parts[0]] = "- "+parts[0]
                    } else {    
                        ungrouped[intent] = "- "+intent
                    }
                    ['welcome'].map(function(i) {
                        ungrouped[i] = "- "+i
                    })
                    // TODO
                    // domainContentParts.push("  use_entities:\n")
                    // domainContentParts.push("  - "+entityForIntent)
                    return null
                })
                Object.values(grouped).map(function(group) {
                  domainContentParts.push(group)  
                })
                Object.values(ungrouped).map(function(group) {
                  domainContentParts.push(group)  
                })
                domainContentParts.push("\n")
            }
            
            if (domainEntities.length > 0) {
                domainContentParts.push("entities:")
                domainEntities.map(function(entity) {
                    domainContentParts.push("- "+entity+"")
                    return null
                })
                domainContentParts.push("\n")
            }
            if (domainSlots.length > 0) {
                domainContentParts.push("slots:")
                domainSlots.map(function(slot,i) {
                    domainContentParts.push("  "+slot+":")
                    domainContentParts.push("    type: "+domainSlotsMeta[slot].type)
                    domainContentParts.push("    influence_conversation: "+(domainSlotsMeta[slot].influence_conversation))
                    return null
                })
                domainContentParts.push("\n")
            }
           // console.log(['DOM',domainContentParts])
            
            
            // UTTERANCES
            if (Object.keys(skill.utterances).length > 0) {
                 var responses = {}
                 Object.keys(skill.utterances).map(function(utteranceKey) {
                    var utterance = skill.utterances[utteranceKey]
                        responses['utter_'+utterance.value] = []
                        var utteranceItem = {text:''}
                        // buttons
                        if (utterance.buttons && utterance.buttons.length > 0) {
                            utterance.buttons.map(function(button) {
                                if (button.label && button.label.trim()) {
                                    utteranceItem.buttons = Array.isArray(utteranceItem.buttons) ? utteranceItem.buttons : []
                                    
                                    var payload = {title: button.title}
                                    if (button.utterance && button.utterance.trim()) {
                                        payload.payload = button.utterance
                                    } else {
                                        payload.payload = button.label
                                    }
                                    utteranceItem.buttons.push(payload)
                                }
                                return null
                            })
                        } 
                        //images
                        if (utterance.images && utterance.images.length > 0 && utterance.images[0] && utterance.images[0].href && utterance.images[0].href.trim()) {
                            //utterance.images.map(function(image) {
                                utteranceItem.image = utterance.images[0].href
                                //Array.isArray(utteranceItem.image) ? utteranceItem.image : []
                                //utteranceItem.image.push(image.href)
                                return null
                            //})
                        } 
                       // console.log(['ULIpre',utteranceItem,utterance.images,utterance.buttons])
                        // text
                        var textOptions = utterance.synonym && utterance.synonym.split("\n").length > 0 ? utterance.synonym.split("\n") : ['']
                        textOptions.map(function(synonym) {
                            var utteranceLineItem = JSON.parse(JSON.stringify(utteranceItem))
                            utteranceLineItem.text = synonym
                           // console.log(['ULI',utteranceLineItem,utteranceItem])
                            responses['utter_'+utterance.value].push(utteranceLineItem)
                            return null
                        })
                     
                        
                        
                        
                        
                    //}
                    return null
                 })
                 //console.log(['ULIposy',responses])
                 responsesContent=[yaml.dump({responses: responses})]
             }
         
             
             //if (Object.keys(responses).length > 0) {
                 //domainContentParts.push('')
                //domainContentParts.push('responses:')
                //Object.keys(responses).map(function(responseKey) {
                    //domainContentParts.push('  - '+responseKey)
                //})
             //}
             
             if (domainActions.length > 0) {
                 domainContentParts.push('')
                domainContentParts.push('actions:')
                domainActions.map(function(action) {
                    domainContentParts.push('  - '+action)
                })
             }
             
             
             
             
               //"rules": [
    //{
      //"rule": "show pic anytime",
      //"steps": [
        //"intent show picture",
        //"action search unsplash"
      //]
    //},
    //{
      //"rule": "welcome",
      //"steps": [
        //"intent welcome",
        //"utter i can show pictures"
      //]
    //},
    //{
      //"rule": "show me pictures",
      //"steps": [
        //"intent show picture",
        //"action search unsplash",
        //"form unsplash what next"
      //],
      //"conditions": [
        //"is_conversation_start ",
        //"has_slot imageSearch",
        //"active_form unsplash what next"
      //]
    //}
  //],
             // RULES
             var rules = []
             if (Array.isArray(skill.rules) && skill.rules.length > 0) {
                 skill.rules.map(function(rule) {
                    var isConversationStart = false
                    var conditions=[]
                    var steps = []
                    if (rule && Array.isArray(rule.conditions)) {
                        rule.conditions.map(function(condition) {
                            //console.log(condition)
                            if (condition.indexOf('is_conversation_start') === 0) {
                                isConversationStart = true
                            } else if (condition.indexOf('has_slot ') === 0) {
                                var slotName = condition.slice(9)
                                var newCondition = {}
                                newCondition[slotName] = true
                                conditions.push({slot_was_set: [newCondition]})
                            } else if (condition.indexOf('active_form ') === 0) {
                                var formName = condition.slice(12)
                                conditions.push({active_loop: formName})
                            }
                        })
                    }
                   // console.log(['CND',conditions])
                    if (rule && Array.isArray(rule.steps)) {
                        rule.steps.map(function(step) {
                            if (step.indexOf('action ') === 0) {
                                steps.push({action:step.slice(7)})
                            } else if (step.indexOf('intent ') === 0) {
                                steps.push({intent:step.slice(7)})
                            } else if (step.indexOf('form ') === 0) {
                          //- action: restaurant_form
                            //- active_loop: restaurant_form
                                var formName = step.slice(5)
                                if (formName.trim()) {
                                    steps.push({action:step.slice(5)})
                                    steps.push({active_loop:step.slice(5)})
                                } else {
                                    steps.push({active_loop: null})
                                }
                            } else if (step.indexOf('utter ') === 0) {
                                steps.push({action:'utter_'+step.slice(6)})
                            }
                        })
                    }
                    if (steps.length > 0) {
                        var newRule = {rule: rule.rule, steps: steps}
                        if (conditions.length > 0) newRule.condition = conditions
                        rule.conversation_start =  true
                        rules.push(newRule)
                    }
                })
            }
             //console.log(['RULES'])
             //console.log(yaml.dump({rules:rules}))
             
            // STORIES
             var stories = []
             if (Array.isArray(skill.stories) && skill.stories.length > 0) {
                 skill.stories.map(function(story) {
                    var steps = []
                    if (story && Array.isArray(story.steps)) {
                        story.steps.map(function(step) {
                            if (step.indexOf('action ') === 0) {
                                steps.push({action:step.slice(7)})
                            } else if (step.indexOf('intent ') === 0) {
                                steps.push({intent:step.slice(7)})
                            } else if (step.indexOf('form ') === 0) {
                                var formName = step.slice(5)
                                if (formName.trim()) {
                                    steps.push({action:step.slice(5)})
                                    steps.push({active_loop:step.slice(5)})
                                } else {
                                    steps.push({active_loop: null})
                                }
                            } else if (step.indexOf('utter ') === 0) {
                                steps.push({action:'utter_'+step.slice(6)})
                            } else if (step.indexOf('slot ') === 0) {
                                var payload = {}
                                payload[step.slice(5)] = ''
                                steps.push({slot_was_set:payload})
                            } else if (step.indexOf('checkpoint ') === 0) {
                                steps.push({checkpoint:step.slice(11)})
                            }
                        })
                    }
                    if (steps.length > 0) {
                        var newStory = {story: story.story, steps: steps}
                        stories.push(newStory)
                    }
                })
            }
             //console.log(['STORIES'])
             //console.log(yaml.dump({stories:stories}))
            
            var configStructure = yaml.load(configContent)
            //console.log(['LOADED CONFIG',configStructure])
            if (stories.length > 0) {
                configStructure.policies.push({name:"TedPolicy", max_history: 5, epochs: 100})
            } 
             
             //console.log(['RE',skill.regexps,skill.forms,skill.stories,skill.rules])
             resolve(generateFolderTree(yaml.dump({version:'2.0',rules:rules}), yaml.dump({version:'2.0',stories:stories}), nluContent,responsesContent.join("\n"), yaml.dump({forms: collatedForms}), fileLookups, actionsContent, yaml.dump(configStructure), domainContentParts.join("\n")+"\n\n"+sessionContent+"\n\n"+responsesContent.join("\n"), credentialsContent, endpointsContent, actionFiles) )

        })
    })
    
}


function exportRASAZip(skill) {
    return new Promise(function(resolve,reject) {
        exportRASA(skill).then(function(data) {
            //console.log(data)
            createZip(data).then(function(res) {
                resolve(res)
            })
        })
    })
}

export {exportRASA, exportRASAZip}
