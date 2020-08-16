import { replaceEntitiesWithValues, uniquifyArray, snakeToCamelCase, camelToSnakeCase, toSnakeCase} from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'
import RASATemplates from './RASATemplates'


 function generateFolderTree(nluContent, fileLookups, actionsContent, configContent, domainContent, credentialsContent, endpointsContent, actionFiles, storyData) {
    var folderTree = {
        files:[
            {name:'actions.py',content:actionsContent},
            {name:'config.yml',content:configContent},
            {name:'domain.yml',content:domainContent},
            {name:'credentials.yml',content:credentialsContent},
            {name:'endpoints.yml',content:endpointsContent}
        ], 
        folders:[
            {name:'actions', files:actionFiles}, 
            {name:'data', 
                files:[{name:'nlu.md', content: nluContent}, {name:'stories.md', content: storyData ? storyData : ''}], 
                folders:[{name:'lookups', files:fileLookups}]
            }
        ]
    }
    console.log(['TREE GEN',folderTree])
    return folderTree
}

// just the models subfolder
// one file per intent
// one file per entity
function exportRASAMD(skill) {
     //"rasa_nlu_data": {
        //"common_examples": [],
        //"regex_features" : [],
        //"lookup_tables"  : [],
        //"entity_synonyms": []
    //}
    //{"rasa_nlu_data":{"regex_features":[],"entity_synonyms":[{"synonyms":["biggest city","capital city"],"value":"capital"}],"common_examples":[{"text":"sounds good sounds good thank you","intent":"affirmative","entities":[]},
      //{"text":"what is the use of a actinometer","intent":"ask_attribute","entities":[{"end":15,"entity":"attribute","start":12,"value":"use"},{"end":32,"entity":"thing","start":21,"value":"actinometer"}]}
    console.log(['EXPPORT RASA',skill])
    return new Promise(function(resolve,reject) {
         var listsStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "lists",
         });
         var utterancesStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "utterances",
         });
        
        //resolve({files:[{name:'nlu.md', content: content}]})
         
         // LOAD ENTITY LISTS
         listsStorage.getItem('alldata').then(function(lists) {
            
            console.log(['LISTS',lists])
            
            // for each entity, collate entity values and lists values
            var entityLists = {}
            if (skill.entities) {
                Object.keys(skill.entities).map(function(entity,i) {
                    const entityValue = skill.entities[entity]
                    // values from examples
                    if (entityValue && entityValue.values) {
                        entityLists[entity] = entityValue.values
                    } 
                    // values from tags
                    if (skill.entities[entity] && Array.isArray(skill.entities[entity].lists)) {
                        lists.map(function(listItem,listItemIndex) {
                            skill.entities[entity].lists.map(function(entityList) {
                               if (listItem.tags && listItem.tags.indexOf(entityList) !== -1) {
                                   entityLists[entity].push(listItem.value)
                               }
                               return null
                            })
                            return null
                        })
                    }
                    return null
                })
            }
             console.log(['LISTS2',entityLists])
             // lookup lists
             var fileLookups=[]
             var lookups = []
             Object.keys(entityLists).map(function(entity) {
                 var values = entityLists[entity]
                 fileLookups.push({name:entity+".txt",content:values.join("\n")})
                 lookups.push('## lookup:'+entity)
                 lookups.push("data/lookups/"+entity+".txt")
                 return null
             })
             
            
            // collate synonyms
            //var synonyms = {}
            var synonymsIndex = {}
            lists.map(function(item) {
                 if (item.value && item.value.trim().length > 0) {
                    if (item.synonym) {
                        if (!Array.isArray(synonymsIndex[item.synonym])) synonymsIndex[item.synonym] = [] 
                        //synonyms[item.value] = item.synonym
                        synonymsIndex[item.synonym].push(item.value)
                    }
                }
                return null
            })
            console.log(['synonyms',synonymsIndex])
            var synonymsOut = []
            Object.keys(synonymsIndex).map(function(synonym) {
                synonymsOut.push('## synonym:'+synonym)
                uniquifyArray(synonymsIndex[synonym]).sort().map(function(item) {
                    // TODO CONVERT TO RASA MD EXAMPLE WITH ENTITIES
                    synonymsOut.push('- '+item)
                    return null
                }) 
                synonymsOut.push("\n")
                return null
            })
            console.log(['synonyms OUT',synonymsOut])
            
            // COMMON EXAMPLES  
            var nluOut=[]
            if (skill.intents) {
                console.log(['have intents',skill.intents])
                Object.keys(skill.intents).map(function(intentKey) {
                    const intentItem = skill.intents[intentKey]
                    console.log('have intent ',intentKey,intentItem)
                    nluOut.push('## intent:'+intentKey)
                    var examples = []
                    intentItem.map(function(example) {
                        // TODO CONVERT TO RASA MD EXAMPLE WITH ENTITIES
                        console.log(['INTY',example])
                        if (example && example.example && example.example.trim().length > 0) {  
                            var key = replaceEntitiesWithValues(example.example, example.entities)
                            examples[key] = '- '+key
                        }
                        return null
                    }) 
                    nluOut=[...nluOut, ...Object.values(examples)]
                    nluOut.push("\n")
                    return null
                })
            }
            var nluContent = nluOut.join("\n")+"\n"+synonymsOut.join("\n")+lookups.join("\n")
            console.log(nluContent)
            // CONSTANTS
             var configContent = skill.rasaConfig ? skill.rasaConfig : RASATemplates.config
            //var domainContent = ''
            var credentialsContent = skill.rasaCredentials ? skill.rasaCredentials : RASATemplates.credentials
            var endpointsContent = skill.rasaEndpoint ? skill.rasaEndpoint : RASATemplates.endpoint
            
            // RASA ACTIONS
            var actionsContent = RASATemplates.actions
            var domainActions = []
            
            var actionFiles = []
            if (Array.isArray(skill.rasaActions)) {
                skill.rasaActions.map(function(action) {
                    if (action && action.trim().length > 0) {
                        var string = snakeToCamelCase(toSnakeCase(camelToSnakeCase(action)))
                        var snake = camelToSnakeCase(string)+'_action'
                        domainActions.push(snake)
                        var name = string && string.trim().length > 0 ? string[0].toUpperCase() + string.substring(1) : ''
                        actionFiles.push({name:name+'Action.py', content:RASATemplates.single_action(name+'Action',snake)})
                        actionsContent+="\n import "+name+'Action.py'
                    }
                    return null
                })
            }
            var domainEntities = skill.entities ? Object.keys(skill.entities) : []
            var domainIntents = skill.intents ? Object.keys(skill.intents) : []
            var domainSlots = skill.slots ?  Object.keys(skill.slots) : (skill.entities ? Object.keys(skill.entities) : [])
            var domainSlotsMeta = {}
            domainSlots.map(function(slot) {
               domainSlotsMeta[slot] = {
                   type: skill.slots && skill.slots[slot] &&  skill.slots[slot].slotType ? skill.slots[slot].slotType : 'unfeaturized'
                }
               return null
            })
            console.log(['DOMAIN',domainEntities, domainIntents, domainSlots, domainSlotsMeta])
            
            var domainContentParts=[]
            if (domainIntents.length > 0) {
                domainContentParts.push("intents:")
                domainIntents.map(function(intent) {
                    domainContentParts.push("- "+intent)
                    // TODO
                    // TODO +":" plus intent entities
                    // domainContentParts.push("  use_entities:\n")
                    // domainContentParts.push("  - "+entityForIntent)
                    return null
                })
                domainContentParts.push("\n")
            }
            
            if (domainEntities.length > 0) {
                domainContentParts.push("entities:")
                domainEntities.map(function(entity) {
                    domainContentParts.push("- "+entity)
                    return null
                })
                domainContentParts.push("\n")
            }
            if (domainSlots.length > 0) {
                domainContentParts.push("slots:")
                domainSlots.map(function(slot,i) {
                    domainContentParts.push("  "+slot+":")
                    domainContentParts.push("    type: "+domainSlotsMeta[slot].type)
                    return null
                })
                domainContentParts.push("\n")
            }
            // append session config
            if (skill.rasaSession) skill.rasaSession.trim().split("\n").map(function(line) {
                domainContentParts.push(line)
            })
            
            // UTTERANCES
            var utterances = {}
            if (skill.utterancesLists || skill.utterances) { 
                utterancesStorage.getItem('alldata').then(function(allUtterances) {
                    if (Array.isArray(allUtterances)) {
                        allUtterances.map(function(thisUtterance) {
                            if (skill.utterances) { 
                                skill.utterances.map(function(listKey) {
                                    if (thisUtterance.value === listKey) utterances[thisUtterance.value] = thisUtterance  
                                    return null
                                })
                            }
                            if (skill.utterancesLists) { 
                                skill.utterancesLists.map(function(listKey) {
                                    if (thisUtterance.tags && thisUtterance.tags.indexOf(listKey) !== -1) utterances[thisUtterance.value] = thisUtterance  
                                    return null
                                })
                                
                            }
                            return null
                        })
                        
                         //fileLookups.push({name:toSnakeCase(utterance.value)+'.txt',content:''})
                             
                        
                         // generate domainContent
                         if (Object.keys(utterances).length > 0) {
                             domainContentParts.push('responses:')
                             Object.keys(utterances).map(function(utteranceKey) {
                                    var utterance = utterances[utteranceKey]
                                    domainContentParts.push('utter_'+toSnakeCase(utterance.value))
                                    domainContentParts.push('- text: '+utterance.value)
                                    if (utterance.synonyms && utterance.synonyms.length > 0) {
                                        utterance.synonyms.map(function(synonym) {
                                            domainContentParts.push('- text: '+synonym)
                                            return null
                                        })
                                    } 
                                    return null
                             })
                         }
                         resolve(generateFolderTree(nluContent, fileLookups, actionsContent, configContent, domainContentParts.join("\n"), credentialsContent, endpointsContent, actionFiles, skill.rasaStories) )
                    } else {
                        resolve(generateFolderTree(nluContent, fileLookups, actionsContent, configContent, domainContentParts.join("\n"), credentialsContent, endpointsContent, actionFiles, skill.rasaStories) )
                    }
                })
               
                
            } else {
                resolve(generateFolderTree(nluContent, fileLookups, actionsContent, configContent, domainContentParts.join("\n"), credentialsContent, endpointsContent, actionFiles, skill.rasaStories) )
            }
        })
        
    })
}


function exportRASAMDZip(skill) {
    return new Promise(function(resolve,reject) {
        exportRASAMD(skill).then(function(data) {
            createZip(data).then(function(res) {
                resolve(res)
            })
        })
    })
}

export {exportRASAMD, exportRASAMDZip}
