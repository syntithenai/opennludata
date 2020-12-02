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
     
            var utteranceResponseSelectors = {}
            // UTTERANCES
            if (Object.keys(skill.utterances).length > 0) {
                 var responses = {}
                 Object.keys(skill.utterances).forEach(function(utteranceKey) {
                    var utterance = skill.utterances[utteranceKey]
                    var parts = utterance && utterance.value ? utterance.value.split("/") : []
                    if (parts.length > 1) {
                        utteranceResponseSelectors[parts[0]] = utteranceResponseSelectors[parts[0]] ? utteranceResponseSelectors[parts[0]] : {}
                        utteranceResponseSelectors[parts[0]][parts[1]] = utteranceResponseSelectors[parts[0]][parts[1]] ? utteranceResponseSelectors[parts[0]][parts[1]] : []
                        var answers = utterance && utterance.synonym ? utterance.synonym.split("\n") : []
                        answers.forEach(function(answer) {
                            utteranceResponseSelectors[parts[0]][parts[1]].push(answer.replace(/{/g,'{{').replace(/}/g,'}}'))
                        })
                    }
                 })
            }
            
            // COMMON EXAMPLES  
            var nluOut=["version:'2.0'","",'nlu:']
            if (skill.intents) {
                var collatedExamples = {}
                Object.keys(skill.intents).map(function(intentKey) {
                     const intentItem = skill.intents[intentKey]
                    collatedExamples[intentKey] = Array.isArray(collatedExamples[intentKey]) ? collatedExamples[intentKey] : []
                    if (Array.isArray(intentItem)) intentItem.map(function(item) {
                        collatedExamples[intentKey].push(replaceEntitiesWithJSON(item.example,item.entities,synonymLookups))
                    })
                    
                    return null
                })
            }
            
            var nlpjsEntities = {}
            var nlpjsIntentData = []
            Object.keys(entityLookups).map(function(entityKey) {
                nlpjsEntities[entityKey] = nlpjsEntities[entityKey] ? nlpjsEntities[entityKey] : {}
                
                  
                if (Array.isArray(entityLookups[entityKey])) {
                    entityLookups[entityKey].map(function(entityValue) {
                        var options = nlpjsEntities[entityKey].options ? nlpjsEntities[entityKey].options : {}
                        if (synonyms.hasOwnProperty(entityValue)) {
                            const key = synonyms[entityValue]
                            options[key] = Array.isArray(options[key]) ? options[key]  : []
                            options[key].push(entityValue)
                            
                        } else {
                            const key = entityValue
                            options[key] = Array.isArray(options[key]) ? options[key]  : []
                            options[key].push(entityValue)
 
                        }
                        nlpjsEntities[entityKey].options = options
                    })
                }
                var trim = []
                if (skill && skill.entities && skill.entities[entityKey]  && skill.entities[entityKey].trims && Array.isArray(skill.entities[entityKey].trims)) {
                    trim = skill.entities[entityKey].trims.map(function(t) {
                        return {position: t.type, words: Array.isArray(t.words) ? t.words.map(function(tw) {return tw.trim()}) : [], opts:{}}
                    })
                }
                nlpjsEntities[entityKey].trim = trim
                
                var regexp = []
                if (skill && skill.entities && skill.entities[entityKey]  && skill.entities[entityKey].regexps && Array.isArray(skill.entities[entityKey].regexps)) {
                    regexp = skill.entities[entityKey].regexps.map(function(t) {
                        return t && t.expression ? t.expression : ''
                    })
                }
                nlpjsEntities[entityKey].regex = regexp
            })
           
            Object.keys(collatedExamples).map(function(intentKey) {
                var parts = intentKey.split("/")
                var answers = []
                if (parts.length > 1 && utteranceResponseSelectors[parts[0]]  && Array.isArray(utteranceResponseSelectors[parts[0]][parts[1]])) {
                    answers = utteranceResponseSelectors[parts[0]][parts[1]]
                }
               
                nlpjsIntentData.push({intent: intentKey, utterances: uniquifyArray(collatedExamples[intentKey]), answers: answers})  
            })
              
            var nlpjsFinal = {name: skill.title, locale: skill && skill.config && skill.config.locale ? skill.config.locale : 'en-US', data: nlpjsIntentData, entities: nlpjsEntities}
           // console.log(['FINALw',nlpjsFinal])
             resolve(nlpjsFinal)

        })
    })
    
}


export {exportNLPJS}
