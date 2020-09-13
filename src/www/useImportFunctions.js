import useImportMergeFunctions from './useImportMergeFunctions'
import useImportUtils from './useImportUtils'
import {useHistory} from 'react-router-dom'
const yaml = require('js-yaml');

export default function useImportFunctions(sendPageMessage) {
    
    const {mergeEntities, mergeIntents, mergeUtterances, mergeRegexps, mergeSkill} = useImportMergeFunctions()
    const {unzip, splitSentences, generateIntentSplits, generateEntitySplits, generateUtteranceSplits, generateMycroftUtteranceSplits, generateIntentSplitsForMycroft, cleanListItem, extractSynonym, sortListSplits, sortExampleSplits, detectFileType, generateSplitsFromJovoJson, generateSplitsFromRasaJson, generateSplitsFromRasaMd} = useImportUtils()
    const history = useHistory()
    /* ONCLICK FUNCTIONS */   
    

    /**
     * Import complete skill without review phase
     */
    
    function importSkillJson(item) {
        return new Promise(function( resolve, reject) {
            var data = {}
            try {
                data = JSON.parse(item.data)
                console.log(['IMPSKILL',data])
        
                // create examples (intents)
                if (data.title) {
                    if (data.intents) {
                        var intents = []
                        Object.keys(data.intents).map(function(intent) {
                            if (data.intents[intent]) {
                                data.intents[intent].map(function(example) {
                                      example.intent = intent
                                      
                                      intents.push(example)
                                })
                            }
                        })
                        mergeIntents(intents, data.title)
                    }
                    // create entities
                    if (data.entitiesData) {
                        var entities = []
                        Object.keys(data.entitiesData).map(function(tag) {
                            if (data.entitiesData[tag]) {
                                data.entitiesData[tag].map(function(entity) {
                                      entity.tags = Array.isArray(entity.tags) ? entity.tags : []
                                      entity.tags.push(tag)
                                      entities.push(entity)
                                })
                            }
                        })
                        mergeEntities(entities)
                    }
                    // create utterances
                    if (data.utterancesData) {
                        var utterances = []
                        Object.values(data.utterancesData).map(function(utterance) {
                            utterances.push(utterance)
                        })
                        mergeUtterances(utterances)
                    }
                    // create regexps
                    if (data.regexps) {
                        var regexps = data.regexps.map(function(utterance) {
                            if (utterance) {
                                return {value: utterance.name, synonym: utterance.synonym}
                            }
                            return {}
                        })
                        mergeRegexps(regexps)
                    }
                    mergeSkill(data)
                }
                // TODO CREATE OTHER RECORDS - INTENT,ENT,UTT,REG
            } catch(e) {}
            resolve(data)
        })
    }
    

    /**
     * Import intents, entities, and utterances 
     */
    function importAll(item) {
        return new Promise(function(resolve, reject) {
             console.log(['import examples',item])
             if (item) {
                  switch(item.fileType) {
                    case 'opennlu.skill':
                        importSkillJson(item).then(function(skill) {
                            //resolve(skill)  
                            if (skill.title && skill.intents && Object.keys(skill.intents).length > 0) {
                                setTimeout(function() {
                                    history.push("/skills/skill/"+skill.title)
                                },500)
                            } else {
                                if (sendPageMessage) sendPageMessage('Failed to load skill. Missing title or intents.',3000)
                            }
                            if (sendPageMessage) sendPageMessage('Imported',2000)
                        })
                        break;
                    case 'mycroft.zip':
                        importMycroft(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    case 'rasa.json':
                        const askill1 = generateSplitsFromRasaJson(item)
                        resolve(askill1)
                        break;
                    case 'rasa.markdown':
                        const askill2 = generateSplitsFromRasaMd(item)
                        resolve(askill2)
                        break;
                    
                    case 'jovo.json':
                        const askill3 = generateSplitsFromJovoJson(item)
                        resolve(askill3)
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
                    default:
                        reject({error:'Invalid file type for import'})
                  }
             } else {
                reject({error:'Failed to import'})
            }
        })
    }
    
    
    function importTextIntents(item, intent = '') {
         console.log(['text',item.data])
         return generateIntentSplits(item.data, intent)
       }
    
        
    function importTextEntities(item, entity = '') {
         console.log(['text',item.data])
         return generateEntitySplits(item.data, entity)
    }
    
        
    function importTextUtterances(item, utterance = '') {
         console.log(['text',item.data])
         return {utterances: generateUtteranceSplits(item.data, utterance)}
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
            unzip(item.data,['*/project.js','*/models/*.js']).then(function(files) {
                console.log(['jovo',files])
                resolve(files)
            })
        })
    }
    
    function importRASADomainFile(content, skill) {
        try {
            var yml = yaml.safeLoad(content);
            if (yml) {
                skill.rasa.actions = yml.actions.join("\n")
                if (yml.slots) {
                    var newSlots = []
                    skill.slots = Object.keys(yml.slots).map(function(slot) {
                        var newSlot = {slotAutofill: slot.auto_fill ? true : false, slotType: slot.type ? slot.type : 'unfeaturized', values : Array.isArray(slot.values) ? slot.values  : [] }
                        newSlots.push(newSlot)
                    })
                    skill.rasa.slots = newSlots
                }
                // TODO utterances responses: { utter_ask_mnemonic: [{text: "Would you like to hear a memory aid"}]}
                // TODO intent - use_entities intents[{ask_followup_attribute: {use_entities:  ["attribute", "word", "person", "place", "thing"]}}]
                if (yml.responses) {
                    
                }
                if (yml.session_config) {
                    var configLines = []
                    Object.keys(yml.session_config).map(function(configLine) {
                        configLines.push(" - "+configLine+" : "+yml.session_config[configLine])
                    })
                    skill.rasa.session = "session_config:\n"+ configLines.join("\n")
                }
             }
            
            console.log('rasa domain',yml)
        } catch(e) {}
        return skill
    }
    
    function importRASA(item) {
        return new Promise(function( resolve, reject) {
            unzip(item.data,['*/config.yaml','*/credentials.yaml','*/endpoints.yaml','*/domain.yaml','*/config.yml','*/credentials.yml','*/endpoints.yml','*/domain.yml','*.md','*.json']).then(function(files) {
                //console.log(['rasa',files])
                var skill = {rasa: {}}
                if (files) files.map(function(file) {
                    if (file.path && (file.path.endsWith('config.yml') || file.path.endsWith('config.yaml'))) {
                        skill.rasa.config = file.data
                    } else if (file.path && (file.path.endsWith('credentials.yml')||file.path.endsWith('credentials.yml'))) {
                        skill.rasa.credentials = file.data
                    } else if (file.path && (file.path.endsWith('endpoints.yml') || file.path.endsWith('endpoints.yaml'))) {
                        skill.rasa.endpoints = file.data
                    } else if (file.path && (file.path.endsWith('domain.yml') || file.path.endsWith('domain.yaml'))) {
                        skill = importRASADomainFile(file.data,skill)
                    } else if (file.path && file.path.endsWith('.json')) {
                        
                    } else if (file.path && file.path.endsWith('.md')) {
                        
                    }
                    console.log(file) 
                })
                resolve(skill)
            })
        })
    }
    
    function importMycroft(item) {
        return new Promise(function( resolve, reject) {
            unzip(item.data,['*.intent','*.dialog','*.entity']).then(function(files) {
                //console.log(['mycroft',files])
                var skill = {}
                var utterances=[]
                var intents=[]
                var entities = []
                
                function nameFromFilename(fullPath) {
                    if (fullPath && fullPath.split) {
                        var pathParts = fullPath.split("/")
                        var fileName = pathParts[pathParts.length -1]
                        var intentName = fileName.slice(0,fileName.length - 7)
                        return intentName
                    }
                    return '_'
                }
                
                if (files) {
                    files.map(function(file) {
                        
                        // for now no internationalisation
                       if (file && file.path && file.path.toLowerCase().indexOf('/en-us/') !== -1)  {
                           var fileParts = file.path.split("/")
                           var name = nameFromFilename(file.path)
                           if (file.path.endsWith('.intent') && file.data) {
                               console.log(file.path, file.data, generateIntentSplits(file.data, name))
                               var intent = fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.intent','') : ''
                               intents = [].concat(generateIntentSplitsForMycroft(file.data, intent), intents)
                           } else if (file.path.endsWith('.dialog')) {
                               var parts = file.path.split("/")
                               var fileName = parts[parts.length -1]
                               console.log(file.path, file.data, generateUtteranceSplits(file.data, name))   
                               var utterance = fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.dialog','')  : ''
                               utterances = [].concat(generateMycroftUtteranceSplits(file.data, fileName.replace('.dialog','')), utterances)
                           } else if (file.path.endsWith('.entity')) {
                               console.log(file.path, file.data, generateEntitySplits(file.data, name)) 
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

    function importEntities(item) {
          return new Promise(function(resolve, reject) {
             console.log(['import entities',item])
             if (item) {
                  if (item.fileType === 'text') {
                        resolve({entities:importTextEntities(item, item.title)})
                  } else if (item.fileType.endsWith('.json')) {
                        importJsonEntities(item).then(function(entities) {
                            resolve({entities:entities})  
                        })
                  } else {
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
                  if (item.fileType === 'text') {
                        resolve(importTextUtterances(item, item.title))
                  } else if (item.fileType.endsWith('.json')) {
                        importJsonUtterances(item).then(function(utterances) {
                            resolve({utterances:utterances})  
                        })
                  } else {
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
                  if (item.fileType === 'text') {
                        resolve({intents:importTextIntents(item, item.title)})
                  } else if (item.fileType.endsWith('.json')) {
                        importJsonIntents(item).then(function(intents) {
                            resolve({intents:intents})  
                        })
                  } else {
                        throw new Error('Invalid file type for import')
                  }
             }
             reject('Failed to import')
        })
    }
        
    
 
    
    
    return {importIntents, importUtterances, importEntities, importAll, detectFileType}
}

