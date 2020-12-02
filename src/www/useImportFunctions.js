import useImportMergeFunctions from './useImportMergeFunctions'
import useImportUtils from './useImportUtils'
import {useHistory} from 'react-router-dom'
import {generateObjectId, cleanEntity, cleanIntent, cleanUtterance, cleanRegexp} from './utils'
const yaml = require('js-yaml');
const path = require('path');
                   
var balanced = require('balanced-match');

export default function useImportFunctions(sendPageMessage) {
    
    const {mergeEntities, mergeIntents, mergeUtterances, mergeRegexps, mergeForms, mergeActions, mergeApis, mergeSkill} = useImportMergeFunctions()
    const {unzip, splitSentences, generateIntentSplits, generateEntitySplits, generateUtteranceSplits, generateMycroftUtteranceSplits, generateIntentSplitsForMycroft, cleanListItem, extractSynonym, sortListSplits, sortExampleSplits, detectFileType, generateSplitsFromJovoJson, generateSplitsFromRasaJson, generateSplitsFromRasaMd, generateSplitsFromRasaYml, titleFromFilename} = useImportUtils()
    const history = useHistory()
    /* ONCLICK FUNCTIONS */   
    
    function importNLPJS(data) {
        //console.log(['imp nlpjs',data])
        return new Promise(function( resolve, reject) {
            // name, locale, data, entities
            var item = {}
            try {
                item = JSON.parse(data.data)
            } catch (e) {}
            //console.log(['IMPSKILL',item])
            var skill = {title: titleFromFilename(data), config:{locale: item && item.locale ? item.locale : 'en-US', contextData: item.contextData ? item.contextData : {}}}
            
            var entities={}
            var intents=[]
            var responses={}
            var regexps=[]
            var entityValues=[]
            var entityCollation = {}
            // entities
            if (item.entities) {
                //console.log(['IMPORT ',item.entities])
                Object.keys(item.entities).map(function(entityName) {
                    entities[entityName] = {lists: [], values: [], regexps: [], trims: []}
                    entities[entityName].lists.push(entityName)
                    if (typeof item.entities[entityName] === "string") {
                        //console.log(['IMPORT regex  ',item.entities[entityName]])
                        entities[entityName].regexps.push({expression: item.entities[entityName] })
                    } else {
                        //console.log(['IMPORT OBJ ',item.entities[entityName].options,item.entities[entityName].regex,,item.entities[entityName].trim])
                        if (item.entities[entityName].options) {
                            Object.keys(item.entities[entityName].options).map(function(synonym) {
                                if (Array.isArray(item.entities[entityName].options[synonym])) {
                                     item.entities[entityName].options[synonym].map(function(value) {
                                        entityValues.push({value: value, synonym: synonym, tags:[entityName]})  
                                        entityCollation[entityName] = Array.isArray(entityCollation[entityName]) ? entityCollation[entityName] : []
                                        entityCollation[entityName].push(value)
                                    })
                                }
                            })
                        }
                        if (item.entities[entityName].regex) {
                            
                            if (typeof item.entities[entityName].regex === "string") {
                                //console.log(['IMPORT OBJ regex string ',item.entities[entityName].regex])
                                entities[entityName].regexps.push({expression: item.entities[entityName].regex })
                                //regexps.push({entity: entityName, synonym: item.entities[entityName].regex, name: entityName })
                            } else if (Array.isArray(item.entities[entityName].regex)) {
                                item.entities[entityName].regex.map(function(reg) {
                                    console.log(['IMPORT OBJ regex in array ',reg])
                                    entities[entityName].regexps.push({expression: reg })
                                })
                            }
                        }
                        if (Array.isArray(item.entities[entityName].trim)) {
                            //console.log(['IMPORT trim array ',item.entities[entityName].trim])
                            entities[entityName].trims = item.entities[entityName].trim
                        }
                    }
                })
            }
            //console.log(['NLPJS ENTS',entities, entityValues, regexps,entityCollation])
            // intents and responses
            var responseSelectors = {}
            if (Array.isArray(item.data)) {
                item.data.map(function(dataItem) {
                    if (dataItem && dataItem.intent && Array.isArray(dataItem.utterances)) {
                        var intentName = dataItem.intent
                        var titleParts = dataItem.intent.split("/")
                        if (titleParts.length > 1) {
                            responseSelectors[titleParts[0]] = 1
                        }
                        var dotTitleParts = dataItem.intent.split(".")
                        if (dotTitleParts.length > 1) {
                            responseSelectors[dotTitleParts[0]] = 1
                            intentName = dotTitleParts[0] + "/" + dotTitleParts.slice(1).join(".")
                        }
                        dataItem.utterances.map(function(utteranceItem) {
                            var exampleEntities = []
                            var latestText = utteranceItem
                            var b = balanced('@',' ',latestText)
                            var limit = 2
                            //console.log(['START',latestText])
                            while (latestText.indexOf('@') !== -1 && limit) {
                                var start = latestText.indexOf('@')
                                //console.log(start)
                                if (start >=0) {
                                    var tmpEnd = latestText.indexOf(' ',start)
                                    tmpEnd = tmpEnd > 0 ? tmpEnd : latestText.length
                                    var entity = latestText.slice(start,tmpEnd ).replace(",",'','g').replace("?",'','g').replace("@",'','g')
                                    var value = entityCollation && Array.isArray(entityCollation[entity]) ? entityCollation[entity][parseInt(Math.random() * entityCollation[entity].length)] : entity
                                    //var value = entity
                                    var end = start + value.length
                                    latestText = latestText.slice(0,start) + value + ' '+ latestText.slice(tmpEnd+1).trim()
                                    //console.log(['LOOP',latestText])
                                    var entity = { entity: entity, value:value, start: start, end: end , type:entity}
                                    exampleEntities.push(entity)
                                    //console.log(entity)
                                    

                                }
                                limit --
                                //var end = 0
                                //var entity = ''
                                    //var endParts = latestText.slice(start).split(' ')
                                    //entity = endParts[0].replace(",",'','g').replace("?",'','g')
                                    //end = start + entity.length
                                    //latestText = latestText.slice(0,start) + value + 
                                //}
                                
                            }
                            
                            //var parts = utteranceItem.split(' ')
                            //parts.map(function(part,key) {
                                //if (part.trim().indexOf('@') === 0) {
                                    //var entityName = part.trim().slice(1)
                                    //var entityValue = '@'+entityName.trim() // TODO from random entity
                                    
                                    //var start = parts.slice(0,key-1).join(' ').length
                                    //var end = start + entityName.length + 1
                                    //exampleEntities.push({entity: entityName, value: entityValue, start: start, end: end})
                                //}
                            //})
                            var exampleText = utteranceItem
                            intents.push({intent: intentName, example:latestText, entities: exampleEntities})
                        })
                        //console.log(['III',intents])
                    }
                    if (dataItem && Array.isArray(dataItem.answers)) {
                        var intentName = dataItem.intent
                        var titleParts = dataItem.intent.split("/")
                        if (titleParts.length > 1) {
                            responseSelectors[titleParts[0]] = 1
                        }
                        var dotTitleParts = dataItem.intent.split(".")
                        if (dotTitleParts.length > 1) {
                            responseSelectors[dotTitleParts[0]] = 1
                            intentName = dotTitleParts[0] + "/" + dotTitleParts.slice(1).join(".")
                        }
                        responses[intentName] = responses[intentName] ? responses[intentName] : {value: intentName, synonym: []}
                        dataItem.answers.map(function(answerItem) {
                            // replace {} with {{}}  in response
                            var res = new RegExp("{{", 'g');
                            var ree = new RegExp("}}", 'g');
                            var responseText = answerItem.replace(res,"{",'g').replace(ree,"}",'g').replace("{ ","{",'g').replace(" }","}",'g').replace("{ ","{",'g').replace(" }","}",'g')
                            responses[intentName].synonym.push(responseText)
                        })
                        responses[intentName].synonym = responses[intentName].synonym.join("\n")
                    }
                })
            }
            skill.intents = intents
            skill.utterances = Object.values(responses)
            skill.regexps = regexps
            skill.regexpsData = regexps.map(function(r) {
              return {value: r.name, synonym: r.synonym, tags:[r.entity]}  
            })
            //console.log(['MERGE',data,{entities: data.entitiesMeta}])
            //mergeSkill(Object.assign({},data,{entities: data.entitiesMeta}))
            skill.entitiesMeta = entities
            skill.entities = entityValues
            // rules from response selectors in intents and utterances
            skill.rules = Object.keys(responseSelectors).map(function(rs) {
                return {
                    rule:'response selector '+rs ,
                    steps: ['intent '+rs,'utter '+rs]
                }
            })
            
            
            //console.log(['import have skill',JSON.stringify(skill)])
            resolve(skill)
        })
    }
    

    /**
     * Import complete skill without review phase
     */
    function importSkillJson(item) {
        return new Promise(function( resolve, reject) {
            var data = {}
            try {
                data = JSON.parse(item.data)
                //console.log(['IMPSKILL',data])
                var promises = []
                var intentEntities = []
                    
                // create examples (intents)
                if (data.title) {
                    if (data.intents) {
                        var intents = []
                        Object.keys(data.intents).map(function(intent) {
                            if (data.intents[intent]) {
                                data.intents[intent].map(function(example) {
                                    if (example) {
                                        example.intent = intent
                                        //if (Array.isArray(example.entities)) {
                                            //example.entities.map(function(entity) {
                                              //if (entity && entity.value) {
                                                  //intentEntities.push({value:entity.value, tags: []})
                                              //}  
                                            //})
                                        //}
                                        intents.push(example)
                                    }
                                })
                            }
                        })
                        promises.push(mergeIntents(intents, data.title))
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
                        intentEntities.map(function(tag) {
                            if (Array.isArray(intentEntities[tag])) {
                                intentEntities[tag].map(function(entity) {
                                      entity.tags = Array.isArray(entity.tags) ? entity.tags : []
                                      entity.tags.push(tag)
                                      entities.push(entity)
                                })
                            }
                        })
                        promises.push(mergeEntities(entities))
                    }
                    // create utterances
                    if (data.utterances) {
                        var utterances = []
                        Object.values(data.utterances).map(function(utterance) {
                            utterances.push(utterance)
                        })
                        promises.push(mergeUtterances(utterances))
                    }
                    // create regexps
                    //if (data.regexps) {
                        //var regexps = data.regexps.map(function(utterance) {
                            //if (utterance) {
                                //return {value: utterance.name, synonym: utterance.synonym}
                            //}
                            //return {}
                        //})
                        //promises.push(mergeRegexps(regexps))
                    //}
                    // create forms
                    if (data.forms) {
                        var forms = Object.values(data.forms).map(function(form) {
                            if (form) {
                                return form //{value: form.name, synonym: utterance.synonym}
                            }
                            return {}
                        })
                        promises.push(mergeForms(forms))
                    }
                    // create actions
                    if (data.actions) {
                        var actions = Object.values(data.actions).map(function(action) {
                            if (action) {
                                return action //{value: utterance.name, synonym: utterance.synonym}
                            }
                            return {}
                        })
                       promises.push( mergeActions(actions))
                    }
                    // create apis
                    if (data.apis) {
                        var apis = Object.values(data.apis).map(function(api) {
                            if (api) {
                                return api//{value: utterance.name, synonym: utterance.synonym}
                            }
                            return {}
                        })
                        promises.push(mergeApis(apis))
                    }
                    Promise.all(promises).then(function(saveResults) {
                        mergeSkill(data)
                    })
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
             //console.log(['import examples',item])
             if (item) {
                  switch(item.fileType) {
                    case 'opennlu.skill':
                        importSkillJson(item).then(function(skill) {
                            //console.log(['IMPORT SKILL JSON COMPLETE NOW SAVE SKILL',skill])
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
                    case 'nlp.js':
                        importNLPJS(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    case 'mycroft.zip':
                        importMycroft(item).then(function(skill) {
                            resolve(skill)  
                        })
                        break;
                    case 'rasa.json':
                        const askill1 = generateSplitsFromRasaJson(item)
                        //console.log(['json1',JSON.stringify(askill1.title)])
                        var entitiesMeta={}
                        askill1.regexps.map(function(regexp) {
                            if (regexp.value && regexp.synonym) {
                                entitiesMeta[regexp.value] = entitiesMeta[regexp.value] ? entitiesMeta[regexp.value] : {lists:[],values:[],regexps:[], trims:[]}
                                regexp.synonym.split("/n").map(function(line) {
                                   if (line && line.trim()) {
                                       entitiesMeta[regexp.value].regexps.push({expression: line})
                                   }  
                                })
                            }
                        })
                        //askill1.title = item && item.name ? item.name : ''
                        askill1.entitiesMeta = entitiesMeta
                        //askill1.title = item && item.title.split(".").slice(0,-1).join('.') ? item.title : ''
                        //console.log(['json2',JSON.stringify(askill1.title)])
                        resolve(askill1)
                        break;
                    case 'rasa.markdown':
                        const askill2 = generateSplitsFromRasaMd(item)
                        console.log(['askill2',askill2,item])
                        var entitiesMeta={}
                        askill2.regexps.map(function(regexp) {
                            if (regexp.value && regexp.synonym) {
                                entitiesMeta[regexp.value] = entitiesMeta[regexp.value] ? entitiesMeta[regexp.value] : {lists:[],values:[],regexps:[], trims:[]}
                                regexp.synonym.split("/n").map(function(line) {
                                   if (line && line.trim()) {
                                       entitiesMeta[regexp.value].regexps.push({expression: line})
                                   }  
                                })
                            }
                        })
                        askill2.entitiesMeta = entitiesMeta
                        //askill2.title = item && item.title ? item.title.split(".").slice(0,-1).join('.') : ''
                        resolve(askill2)
                        break;
                    case 'rasa.yml':
                        const askill3 = generateSplitsFromRasaYml(item)
                        
                        var entitiesMeta={}
                        
                        askill3.regexps.map(function(regexp) {
                            if (regexp.value && regexp.synonym) {
                                entitiesMeta[regexp.value] = entitiesMeta[regexp.value] ? entitiesMeta[regexp.value] : {lists:[],values:[],regexps:[], trims:[]}
                                regexp.synonym.split("/n").map(function(line) {
                                   if (line && line.trim()) {
                                       entitiesMeta[regexp.value].regexps.push({expression: line})
                                   }  
                                })
                            }
                        })
                        askill3.entitiesMeta = entitiesMeta
                        //askill3.title = item && item.title ? item.title.split(".").slice(0,-1).join('.') : ''
                        resolve(askill3)
                        break;
                    case 'jovo.json':
                        const askill4 = generateSplitsFromJovoJson(item)
                        resolve(askill4)
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
         //console.log(['text',item.data])
         return generateIntentSplits(item.data, intent)
       }
    
        
    function importTextEntities(item, entity = '') {
         //console.log(['text',item.data])
         return generateEntitySplits(item.data, entity)
    }
    
        
    function importTextUtterances(item, utterance = '') {
         //console.log(['text',item.data])
         return {utterances: generateUtteranceSplits(item.data, utterance)}
    }
    
    
    function importJsonIntents(item) {
        return new Promise(function( resolve, reject) {
            //console.log(['json',item.data])
            resolve([])
        })
    }
    
    function importJsonEntities(item) {
        return new Promise(function( resolve, reject) {
            //console.log(['json',item.data])
            resolve([])
        })
    }
    
    function importJsonUtterances(item) {
        return new Promise(function( resolve, reject) {
            //console.log(['json',item.data])
            resolve([])
        })
    }
 
    function importJovo(item) {
        //console.log(['imp jovo',item])
        return new Promise(function( resolve, reject) {
            unzip(item.data,['*/en-US.json']).then(function(files) {
                //console.log(['jovo fil',files])
                if (files) files.map(function(file) {
                    var pathParts = path.basename(item.title).split(".")
                    file.name = pathParts[0]
                    var splits = generateSplitsFromJovoJson(file)
                    //console.log(['jovo spl',splits])
                    resolve(splits)
                
                })
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
                // TODO intent - use_entities intents[{ask_followup_attribute: {use_entities:  ["attribute", "word", "person", "place", "thing"]}}]
                if (yml.responses) {
                    var utterances=[]
                    Object.keys(yml.responses).map(function(utteranceKey) {
                        var alts=[]
                        yml.responses[utteranceKey].map(function(alt) {
                            alts.push(alt.text)
                        })
                        utterances.push({'id':generateObjectId(), 'value':utteranceKey, synonym:alts.join("\n")})
                    })
                }
                if (yml.session_config) {
                    var configLines = []
                    Object.keys(yml.session_config).map(function(configLine) {
                        configLines.push(" - "+configLine+" : "+yml.session_config[configLine])
                    })
                    skill.rasa.session = "session_config:\n"+ configLines.join("\n")
                }
             }
            
            ////console.log('rasa domain',yml)
        } catch(e) {}
        return skill
    }
    
    function importRASA(item) {
        console.log(['import rasa',item])
        return new Promise(function( resolve, reject) {
            unzip(item.data,['*/config.yaml','*/credentials.yaml','*/endpoints.yaml','*/domain.yaml','*/config.yml','*/credentials.yml','*/endpoints.yml','*/domain.yml','*.md','*.json',"*.yml","*.yaml"]).then(function(files) {
                console.log(['rasa',files])
                var title = item && item.title ? item.title.split(".").slice(0,-1).join('.') : ''
                var skill = {title : title, 
                        rasa: {}, entities:[], regexps: [], intents: []}
                if (files) files.map(function(file) {
                    if (file.path) {
                        var pathParts = path.basename(item.title).split(".")
                        file.name = pathParts[0]
                        if ((file.path.endsWith('config.yml') || file.path.endsWith('config.yaml'))) {
                            skill.rasa.config = file.data
                        } else if ((file.path.endsWith('credentials.yml')||file.path.endsWith('credentials.yml'))) {
                            skill.rasa.credentials = file.data
                        } else if ((file.path.endsWith('endpoints.yml') || file.path.endsWith('endpoints.yaml'))) {
                            skill.rasa.endpoints = file.data
                        } else if (file.path && (file.path.endsWith('domain.yml') || file.path.endsWith('domain.yaml'))) {
                            skill = importRASADomainFile(file.data,skill)
                        } else if (file.path.endsWith('.json')) {
                            var intentSkill = generateSplitsFromRasaJson(file, files)
                            //console.log(['IMPORTED RASA JSON',intentSkill,file]) 
                            skill.intents = [].concat(skill.intents,intentSkill.intents)
                            skill.regexps = [].concat(skill.regexps,intentSkill.regexps)
                            skill.entities = [].concat(skill.entities,intentSkill.entities)
                        } else if (file.path.endsWith('.md')) {
                            var intentSkill = generateSplitsFromRasaMd(file, files)
                            //console.log(['IMPORTED RASA MD',intentSkill,file]) 
                            skill.intents = [].concat(skill.intents,intentSkill.intents)
                            skill.regexps = [].concat(skill.regexps,intentSkill.regexps)
                            skill.entities = [].concat(skill.entities,intentSkill.entities)
                        } else if ((file.path.endsWith('nlu.yml') || file.path.endsWith('.yaml'))) {
                            var intentSkill = generateSplitsFromRasaYml(file, files)
                            //console.log(['IMPORTED RASA yml',intentSkill,file]) 
                            //console.log(['IMPORTED RASA yml reg',skill.regexps,intentSkill.regexps]) 
                            skill.intents = [].concat(skill.intents,intentSkill.intents)
                            skill.regexps = [].concat(skill.regexps,intentSkill.regexps)
                            skill.entities = [].concat(skill.entities,intentSkill.entities)
                        }
                    }
                    //console.log(file) 
                })
                // map regexps into entities and expand synonyms
                // save into skill.entitiesMeta
                // ensure all regexps iterated regardeless of entities
                
                var entitiesMeta={}
                //skill.entities.forEach(function(entity) {
                    //if (entity && entity.value) {
                        //entitiesMeta[entity.value] = entitiesMeta[entity.value] ? entitiesMeta[entity.value] : {lists:[],values:[],regexps:[], trims:[]}
                        //entitiesMeta[entity.value].values.push(entity.value)
                    //}
                //})
                //Object.keys(collated).map(function(entityKey) {
                    //var entity = collated[entityKey]    
                skill.regexps.map(function(regexp) {
                    //entitiesMeta
                    //skill.entities[entity].regexps = Array.isArray(skill.entities[entity].regexps) ? skill.entities[entity].regexps : []
                    if (regexp.value && regexp.synonym) {
                        entitiesMeta[regexp.value] = entitiesMeta[regexp.value] ? entitiesMeta[regexp.value] : {lists:[],values:[],regexps:[], trims:[]}
                        regexp.synonym.split("/n").map(function(line) {
                           if (line && line.trim()) {
                               entitiesMeta[regexp.value].regexps.push({expression: line})
                           }  
                        })
                    }
                 
                })
                //})
                skill.entitiesMeta = entitiesMeta
                
                //console.log(['IMPORTED RASA',skill,entitiesMeta,skill.entities]) 
                resolve(skill)
            })
        })
    }
    
    function importMycroft(item) {
        return new Promise(function( resolve, reject) {
            unzip(item.data,['*.intent','*.dialog','*.entity']).then(function(files) {
                ////console.log(['mycroft',files])
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
                        var pathParts = path.basename(item.title).split(".")
                        var skillName = pathParts[0]
                        
                        // for now no internationalisation
                       if (file && file.path && file.path.toLowerCase().indexOf('/en-us/') !== -1)  {
                           var fileParts = file.path.split("/")
                           var name = nameFromFilename(file.path)
                           if (file.path.endsWith('.intent') && file.data) {
                               //console.log(file.path, file.data, generateIntentSplits(file.data, name))
                               var intent = cleanIntent(fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.intent','') : '')
                               intents = [].concat(generateIntentSplitsForMycroft(file.data, intent,''), intents)
                           } else if (file.path.endsWith('.dialog')) {
                               var parts = file.path.split("/")
                               var fileName = parts[parts.length -1]
                               //console.log(file.path, file.data, generateUtteranceSplits(file.data, name))   
                               var utterance = cleanUtterance(fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.dialog','')  : '')
                               utterances = [].concat(generateMycroftUtteranceSplits(file.data, fileName.replace('.dialog','')), utterances)
                           } else if (file.path.endsWith('.entity')) {
                               //console.log(file.path, file.data, generateEntitySplits(file.data, name)) 
                               var entity = cleanEntity(fileParts.length > 1 ? fileParts[fileParts.length -1].replace('.entity','')  : '')
                               entities = [].concat(generateEntitySplits(file.data, entity), entities)
                           }
                       }
                    })
                }
                skill.utterances = utterances
                skill.intents = intents
                skill.entities = entities
                var title = item && item.title ? item.title.split(".").slice(0,-1).join('.') : ''
                skill.title = title
                //console.log(['MYIMNPO',skill])
                resolve(skill)
            })
        })
    }

    function importEntities(item) {
          return new Promise(function(resolve, reject) {
             //console.log(['import entities',item])
             if (item) {
                  if (item.fileType === 'text') {
                        resolve({entities:importTextEntities(item, item.title)})
                  } else if (item.fileType.endsWith('.json')) {
                        importJsonEntities(item).then(function(entities) {
                            //console.log(['imported entities',entities])
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
             //console.log(['import utterances',item])
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
             //console.log(['import intents',item])
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

