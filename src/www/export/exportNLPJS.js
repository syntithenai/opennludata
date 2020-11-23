import { replaceEntitiesWithValues, uniquifyArray, snakeToCamelCase, camelToSnakeCase, toSnakeCase} from '../utils';
import {exportJSON} from './exportJSON'

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
                //var replacementMeta = {entity: entity.type}
                //if (synonymLookups[entity.value] && synonymLookups[entity.value].trim()) {
                    //replacementMeta.value = synonymLookups[entity.value]
                //}
                var replacement = '@'+entity.type //+']'+JSON.stringify(replacementMeta)
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


function exportNLPJS(skill) {

    return new Promise(function(resolve,reject) {
         
        exportJSON(skill).then(function(json) {
            console.log(['EXP NLPJS ',skill])
            // COMMON EXAMPLES  
            // ENTITY LOOKUPS AND CACHE SYNONYMS
            var synonymLookups = {}
            var synonyms = {}
            var entityLookups = {}
            Object.keys(skill.entities).map(function(entityKey) {
                // from examples
                if (skill.entities[entityKey] && Array.isArray(skill.entities[entityKey].values)) {
                    skill.entities[entityKey].values.map(function(value) {
                        entityLookups[entityKey] = Array.isArray(entityLookups[entityKey]) ? entityLookups[entityKey] : []
                        entityLookups[entityKey].push(value)
                        return null
                    })
                }
                // from related lists
                if (skill.entities[entityKey] && Array.isArray(skill.entities[entityKey].lists)) {
                    skill.entities[entityKey].lists.map(function(list) {
                        if (list && skill.entitiesData && Array.isArray(skill.entitiesData[list])) {
                            skill.entitiesData[list].map(function(entityData) {
                                if (entityData.value && entityData.value.trim()) {
                                    entityLookups[entityKey] = Array.isArray(entityLookups[entityKey]) ? entityLookups[entityKey] : []
                                    entityLookups[entityKey].push(entityData.value)
                                    if (entityData.synonym && entityData.synonym.trim()) {
                                        synonyms[entityData.value] = entityData.synonym
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
            var nluOut=["version:'2.0'","",'nlu:']
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
               
            }
            
            // REGEXPS
            var collatedRegexps = {}
            if (skill && skill.regexps && Object.keys(skill.regexps).length > 0) {
                 Object.keys(skill.regexps).map(function(regexpKey) {
                    var regexp = skill.regexps[regexpKey]
                    if (regexp && regexp.synonym && regexp.synonym.trim() && regexp.entity && regexp.entity.trim()) {
                        collatedRegexps[regexp.entity] = Array.isArray(collatedRegexps[regexp.entity]) ? collatedRegexps[regexp.entity] : []
                        collatedRegexps[regexp.entity].push(regexp.synonym)
                    }
                })
                
            }
       
            
            
            //// UTTERANCES
            //if (Object.keys(skill.utterances).length > 0) {
                 //var responses = {}
                 //Object.keys(skill.utterances).map(function(utteranceKey) {
                    //var utterance = skill.utterances[utteranceKey]
                        //responses['utter_'+utterance.value] = []
                        //var utteranceItem = {text:''}
                        //// buttons
                        //if (utterance.buttons && utterance.buttons.length > 0) {
                            //utterance.buttons.map(function(button) {
                                //if (button.label && button.label.trim()) {
                                    //utteranceItem.buttons = Array.isArray(utteranceItem.buttons) ? utteranceItem.buttons : []
                                    
                                    //var payload = {title: button.title}
                                    //if (button.utterance && button.utterance.trim()) {
                                        //payload.payload = button.utterance
                                    //} else {
                                        //payload.payload = button.label
                                    //}
                                    //utteranceItem.buttons.push(payload)
                                //}
                                //return null
                            //})
                        //} 
                        ////images
                        //if (utterance.images && utterance.images.length > 0 && utterance.images[0] && utterance.images[0].href && utterance.images[0].href.trim()) {
                            ////utterance.images.map(function(image) {
                                //utteranceItem.image = utterance.images[0].href
                                ////Array.isArray(utteranceItem.image) ? utteranceItem.image : []
                                ////utteranceItem.image.push(image.href)
                                //return null
                            ////})
                        //} 
                        //console.log(['ULIpre',utteranceItem,utterance.images,utterance.buttons])
                        //// text
                        //var textOptions = utterance.synonym && utterance.synonym.split("\n").length > 0 ? utterance.synonym.split("\n") : ['']
                        //textOptions.map(function(synonym) {
                            //var utteranceLineItem = JSON.parse(JSON.stringify(utteranceItem))
                            //utteranceLineItem.text = synonym
                            //console.log(['ULI',utteranceLineItem,utteranceItem])
                            //responses['utter_'+utterance.value].push(utteranceLineItem)
                            //return null
                        //})
                     
                        
                        
                        
                        
                    ////}
                    //return null
                 //})
                 //console.log(['ULIposy',responses])
                 //responsesContent=[yaml.dump({responses: responses})]
             //}
             
             
             //// RULES
             //var rules = []
             //if (Array.isArray(skill.rules) && skill.rules.length > 0) {
                 //skill.rules.map(function(rule) {
                    //var isConversationStart = false
                    //var conditions=[]
                    //var steps = []
                    //if (rule && Array.isArray(rule.conditions)) {
                        //rule.conditions.map(function(condition) {
                            //console.log(condition)
                            //if (condition.indexOf('is_conversation_start') === 0) {
                                //isConversationStart = true
                            //} else if (condition.indexOf('has_slot ') === 0) {
                                //var slotName = condition.slice(9)
                                //var newCondition = {}
                                //newCondition[slotName] = true
                                //conditions.push({slot_was_set: [newCondition]})
                            //} else if (condition.indexOf('active_form ') === 0) {
                                //var formName = condition.slice(12)
                                //conditions.push({active_loop: formName})
                            //}
                        //})
                    //}
                    //console.log(['CND',conditions])
                    //if (rule && Array.isArray(rule.steps)) {
                        //rule.steps.map(function(step) {
                            //if (step.indexOf('action ') === 0) {
                                //steps.push({action:step.slice(7)})
                            //} else if (step.indexOf('intent ') === 0) {
                                //steps.push({intent:step.slice(7)})
                            //} else if (step.indexOf('form ') === 0) {
                          ////- action: restaurant_form
                            ////- active_loop: restaurant_form
                                //var formName = step.slice(5)
                                //if (formName.trim()) {
                                    //steps.push({action:step.slice(5)})
                                    //steps.push({active_loop:step.slice(5)})
                                //} else {
                                    //steps.push({active_loop: null})
                                //}
                            //} else if (step.indexOf('utter ') === 0) {
                                //steps.push({action:'utter_'+step.slice(6)})
                            //}
                        //})
                    //}
                    //if (steps.length > 0) {
                        //var newRule = {rule: rule.rule, steps: steps}
                        //if (conditions.length > 0) newRule.condition = conditions
                        //rule.conversation_start =  true
                        //rules.push(newRule)
                    //}
                //})
            //}
             //console.log(['RULES'])
             //console.log(yaml.dump({rules:rules}))
             //{
  //"name": "Corpus with entities",
  //"locale": "en-US",
  //"contextData": "./heros.json",
             //"entities": {
    //"hero": {
      //"options": {
        //"spiderman": ["spiderman", "spider-man"],
        //"ironman": ["ironman", "iron-man"],
        //"thor": ["thor"]
      //}
    //},
    
        console.log(['ENTITY LOOKUPS',entityLookups])
            var nlpjsEntities = {}
            var nlpjsIntentData = []
            Object.keys(entityLookups).map(function(entityKey) {
                if (Array.isArray(entityLookups[entityKey])) {
                    entityLookups[entityKey].map(function(entityValue) {
                        nlpjsEntities[entityKey] = nlpjsEntities[entityKey] ? nlpjsEntities[entityKey] : {}
                        var options = nlpjsEntities[entityKey].options ? nlpjsEntities[entityKey].options : {}
                        if (synonyms.hasOwnProperty(entityValue)) {
                            const key = synonyms[entityValue]
                            options[key] = Array.isArray(options[key]) ? options[key]  : []
                            //if (options[key].indexOf(entityValue) === -1) 
                            options[key].push(entityValue)
                            
                        } else {
                            const key = entityValue
                            options[key] = Array.isArray(options[key]) ? options[key]  : []
                            //if (options[key].indexOf(entityValue) === -1) 
                            options[key].push(entityValue)
 
                        }
                        nlpjsEntities[entityKey].options = options
                    })
                }
                
                //if (synonyms.hasOwnProperty(entityKey) && Array.isArray(synonyms[entityKey])) {
                    //nlpjsEntities[entityKey] = {options : synonyms[entityKey]}
                    
                //} else {
                    //var options = {}
                    //if (Array.isArray(entityLookups[entityKey]) && entityLookups[entityKey].length > 0) {
                        //entityLookups[entityKey].map(function(entityValue) {
                            //options[entityValue] = [entityValue]
                        //})
                    //}
                    //nlpjsEntities[entityKey] = {options : options}
                //}
            })
            // corpus format doesn't allow both options and regexp so export regexp matches 
            // as a different entity when there is a conflict
            Object.keys(collatedRegexps).map(function(entityKey) {
                if (nlpjsEntities.hasOwnProperty(entityKey)) {  
                    // avoid conflict
                    nlpjsEntities[entityKey+'_regexp'] = collatedRegexps[entityKey]
                } else {
                    // use regexp text as entity definition
                    nlpjsEntities[entityKey] = collatedRegexps[entityKey]
                }
            })
            Object.keys(collatedExamples).map(function(intentKey) {
              nlpjsIntentData.push({intent: intentKey, utterances: uniquifyArray(collatedExamples[intentKey])})  
            })
            var nlpjsFinal = {name: skill.title, locale: skill && skill.config && skill.config.locale ? skill.config.locale : 'en-US', data: nlpjsIntentData, entities: nlpjsEntities}
            console.log(['FINAL',nlpjsFinal])
             resolve(nlpjsFinal)

        })
    })
    
}


export {exportNLPJS}
