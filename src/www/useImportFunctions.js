import useImportMergeFunctions from './useImportMergeFunctions'
import useImportUtils from './useImportUtils'

export default function useImportFunctions() {
    
    const {mergeEntities, mergeIntents, mergeUtterances} = useImportMergeFunctions()
    const {unzip, splitSentences, generateIntentSplits, generateEntitySplits, generateUtteranceSplits, cleanListItem, extractSynonym, sortListSplits, sortExampleSplits, detectFileType} = useImportUtils()

    /* ONCLICK FUNCTIONS */   
    
    /**
     * Import intents, entities, and utterances 
     */
    function importAll(item) {
        return new Promise(function(resolve, reject) {
             console.log(['import examples',item])
             if (item) {
                  switch(item.fileType) {
                    case 'skill.json':
                        importSkillJson(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    case 'jovo.zip':
                        importJovo(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    case 'rasa.zip':
                        importRASA(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    case 'mycroft.zip':
                        importMycroft(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    default:
                        resolve({error:'Invalid file type for import'})
                  }
             } else {
                reject({error:'Failed to import'})
            }
        })
    }
    
    
    function importTextIntents(item) {
         console.log(['text',item.data])
         return generateIntentSplits(item.data)
       }
    
        
    function importTextEntities(item) {
         console.log(['text',item.data])
         return generateEntitySplits(item.data)
    }
    
        
    function importTextUtterances(item) {
         console.log(['text',item.data])
         return generateUtteranceSplits(item.data)
    }
    
    
    function importJsonIntents(item) {
        return new Promise(function( resolve, reject) {
            console.log(['json',item.data])
            resolve([])
        })
    }
    
    function importJsonEntities(item) {
        return new Promise(function( resolve, reject) {
            console.log(['json',item.data])
            resolve([])
        })
    }
    
    function importJsonUtterances(item) {
        return new Promise(function( resolve, reject) {
            console.log(['json',item.data])
            resolve([])
        })
    }
    
    
    function importJovo(item) {
        return new Promise(function( resolve, reject) {
            unzip(item.data,['/project.js','/models/*.js']).then(function(files) {
                console.log(['jovo',files])
                resolve(files)
            })
        })
    }
    
    function importRASA(item) {
        return new Promise(function( resolve, reject) {
            unzip(item.data,['/domain.yml','nlu.md','nlu.json']).then(function(files) {
                //console.log(['rasa',files])
                resolve(files)
            })
        })
    }
    
    function importMycroft(item) {
        return new Promise(function( resolve, reject) {
            unzip(item.data,['.intent','.dialog','.entity']).then(function(files) {
                //console.log(['mycroft',files])
                var skill = {}
                var utterances=[]
                var intents=[]
                var entities = []
                if (files) {
                    files.map(function(file) {
                        
                        // for now no internationalisation
                       if (file && file.path && file.path.toLowerCase().indexOf('/en-us/') !== -1)  {
                           var fileParts = file.path.split("/")
                              
                           if (file.path.endsWith('.intent') && file.data) {
                               console.log(file.path, file.data, generateIntentSplits(file.data))
                               var intent = fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.intent','') : ''
                               intents = [].concat(generateIntentSplits(file.data, intent), intents)
         
                           } else if (file.path.endsWith('.dialog')) {
                               console.log(file.path, file.data, generateUtteranceSplits(file.data))   
                               var utterance = fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.dialog','')  : ''
                               utterances = [].concat(generateUtteranceSplits(file.data, utterance), utterances)
                           } else if (file.path.endsWith('.entity')) {
                               console.log(file.path, file.data, generateEntitySplits(file.data)) 
                               var entity = fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.entity','')  : ''
                               entities = [].concat(generateEntitySplits(file.data, entity), entities)
                           }
                       }
                    })
                }
                skill.utterances = utterances
                skill.intents = intents
                skill.entities = entities
                console.log(['MYIMNPO',skill])
                resolve(skill)
            })
        })
    }
    
    function importSkillJson(item) {
        return new Promise(function( resolve, reject) {
            var data = {}
            try {
                data = JSON.parse(item.data)
                // TODO CREATE OTHER RECORDS - INTENT,ENT,UTT,REG
            } catch(e) {}
            resolve(data)
        })
    }
    
    
    

    function importEntities(item) {
          return new Promise(function(resolve, reject) {
             console.log(['import entities',item])
             if (item) {
                  switch(item.fileType) {
                      case 'text':
                        resolve({entities:importTextEntities(item)})
                        break;
                    case 'json':
                        importJsonEntities(item).then(function(entities) {
                            resolve({entities:entities})  
                        })
                        break;
                    case 'jovo.zip':
                        importJovo(item).then(function(skill) {
                            resolve({entities:skill.entities ? skill.entities : []})  
                        })
                        break;
                    case 'rasa.zip':
                        importRASA(item).then(function(skill) {
                            resolve({entities:skill.entities ? skill.entities : []})  
                        })
                        break;
                    case 'mycroft.zip':
                        importMycroft(item).then(function(skill) {
                            resolve({entities:skill.entities ? skill.entities : []})  
                        })
                        break;
                    default:
                        throw new Error('Invalid file type for import')
                  }
             }
             reject('Failed to import')
        })
    }

    function importUtterances(item) {
         return new Promise(function(resolve, reject) {
             console.log(['import utterances',item])
             if (item) {
                  switch(item.fileType) {
                      case 'text':
                        resolve({utterances:importTextUtterances(item)})
                        break;
                    case 'json':
                        importJsonUtterances(item).then(function(utterances) {
                            resolve({utterances:utterances})  
                        })
                        break;
                    case 'jovo.zip':
                        importJovo(item).then(function(skill) {
                            resolve({utterances:skill.utterances ? skill.utterances : []})  
                        })
                        break;
                    case 'rasa.zip':
                        importRASA(item).then(function(skill) {
                            resolve({utterances:skill.utterances ? skill.utterances : []})  
                        })
                        break;
                    case 'mycroft.zip':
                        importMycroft(item).then(function(skill) {
                            resolve({utterances:skill.utterances ? skill.utterances : []})  
                        })
                        break;
                    default:
                        throw new Error('Invalid file type for import')
                  }
             }
             reject('Failed to import')
        })
    }
    

    function importIntents(item) {
          return new Promise(function(resolve, reject) {
             console.log(['import intents',item])
             if (item) {
                  switch(item.fileType) {
                      case 'text':
                        resolve({intents:importTextIntents(item)})
                        break;
                    case 'json':
                        importJsonIntents(item).then(function(intents) {
                            resolve({intents:intents})  
                        })
                        break;
                    case 'jovo.zip':
                        importJovo(item).then(function(skill) {
                            resolve({intents:skill.intents ? skill.intents : []})  
                        })
                        break;
                    case 'rasa.zip':
                        importRASA(item).then(function(skill) {
                            resolve({intents:skill.intents ? skill.intents : []})  
                        })
                        break;
                    case 'mycroft.zip':
                        importMycroft(item).then(function(skill) {
                            resolve({intents:skill.intents ? skill.intents : []})  
                        })
                        break;
                    default:
                        throw new Error('Invalid file type for import')
                  }
             }
             reject('Failed to import')
        })
    }
        
    
 
    
    
    return {importIntents, importUtterances, importEntities, importAll, detectFileType}
}

