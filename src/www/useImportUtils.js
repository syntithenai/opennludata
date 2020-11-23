import JSZip from 'jszip'
import parenthesis from 'parenthesis'
import {generateObjectId, uniquifyArray, multiplyArrays, expandOptions, splitSentences, cleanEntity, cleanIntent, cleanRegexp, cleanUtterance} from './utils'

const yaml = require('js-yaml');
                    
var balanced = require('balanced-match');


    function detectFileType(item) {
        return new Promise(function(resolve,reject) {
            //console.log(['DETECT FILE TYPE',item])
            try {
                var json = JSON.parse(item.data)
                // RASA JSON FORMAT
                if (json && json.rasa_nlu_data && json.rasa_nlu_data.common_examples) {
                    resolve( {type: 'rasa.json'})
                // JOVO JSON { "invocation": "my test app", "intents": [{"name": "HelloWorldIntent","phrases": ["hello","say hello"]}] } ,
                } else if (json && json.title && json.intents && json.entities && json.id) {
                    resolve({type: 'opennlu.skill'})
                } else if (json && json.invocation && json.intents) {
                    resolve({type: 'jovo.json'})
                } else if (json && json.utterances) {
                    resolve({type: 'opennlu.utterances'})
                } else if (json && json.lists) {
                    resolve({type: 'opennlu.lists'})
                } else if (json && json.regexps) {
                    resolve({type: 'opennlu.regexps'})
                } else {
                    resolve({type: 'json'})
                }
            } catch (e) {
                // try zip file
                var zip = new JSZip();
                 zip.loadAsync(item.data)                                   // 1) read the Blob
                .then(function(zip) {
                    var found={}
                    zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
                        //console.log( zipEntry.name)
                        // rasa
                        if (zipEntry.name.indexOf('/domain.yml') !== -1) found['rasa_domain'] = true 
                        if (zipEntry.name.indexOf('/data/nlu.md') !== -1) found['rasa_data'] = true
                        // jovo
                        if (zipEntry.name.indexOf('/project.js') !== -1) found['jovo_project'] = true
                        if (zipEntry.name.indexOf('/models/en-US.js') !== -1) found['jovo_lang'] = true
                        // mycroft
                        if (zipEntry.name.indexOf('/__init__.py') !== -1) found['mycroft_index'] = true
                        if (zipEntry.name.indexOf('/vocab') !== -1) found['mycroft_vocab'] = true
                        //console.log(['FOUND',found])
                    });
                    //console.log(['FOUND',found])
                    if (found['rasa_domain'] && found['rasa_data']) {
                        resolve({type: 'rasa.zip'})
                    } else if (found['rasa_domain'] && found['rasa_data']) {
                        resolve({type: 'jovo.zip'})
                    } else if (found['mycroft_index'] && found['mycroft_vocab']) {
                        resolve({type: 'mycroft.zip'})
                    } else if (found['jovo_project'] && found['jovo_lang']) {
                        resolve({type: 'jovo.zip'})
                    } else {
                        resolve()
                    }
                }, function (e) {
                    console.log('NOT ZIP')
                    ////console.log(e)
                     
                    // Get document, or throw exception on error
                    try {
                      const doc = yaml.safeLoad(item.data);
                      //console.log(['yaml rasa',doc,parseFloat(doc.version)]);
                      if (doc.version && parseFloat(doc.version) >=  2) {
                          //console.log('v2');
                          if (doc.nlu || doc.stories || doc.rules) {
                              console.log('has element');
                              resolve({type:'rasa.yml'})
                          } else {
                              console.log('fallback ');
                              if (item.data && item.data.indexOf('## intent:') !== -1) {
                                  console.log('fallback md');
                                    resolve({type: 'rasa.markdown'})
                                } else {
                                    console.log('fallback text');
                                    resolve({type: 'text'})
                                }
                          }
                      }  else {
                          console.log('fallback ');
                          if (item.data && item.data.indexOf('## intent:') !== -1) {
                              console.log('fallback md');
                                resolve({type: 'rasa.markdown'})
                            } else {
                                console.log('fallback text');
                                resolve({type: 'text'})
                            }
                      }
                    } catch (e) {
                        console.log('fallback catch');
                      //console.log(e);
                        // plain text markdown ??
                        if (item.data && item.data.indexOf('## intent:') !== -1) {
                            resolve({type: 'rasa.markdown'})
                        } else {
                            resolve({type: 'text'})
                        }
                      
                    }
                    
                });
                
            }  
        })
               
    }


/**
 *  unzip a file and extract the content for files matching paths found in pathFilters array
 */
function unzip(content,pathFilters) {
    
    function matchRuleShort(str, rule) {
      var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
      return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
    }
    return new Promise (function( resolve, reject) {
        var zip = new JSZip();
        zip.loadAsync(content)
        .then(function(zip) {
            var promises=[]
            zip.forEach(function (relativePath, zipEntry) {
                ////console.log(relativePath,zipEntry)
                var found = false
                for (var j in pathFilters) {
                    var pathFilter = pathFilters[j]
                    //console.log(['COMPARE', matchRuleShort(relativePath, pathFilter), relativePath, pathFilter])
                    if (matchRuleShort(relativePath, pathFilter)) { 
                        found = true
                    }
                }
                //for (var j in pathFilters) {
                    //var pathFilter = pathFilters[j]
                    //if ( zipEntry.name.indexOf(pathFilter) !== -1) { 
                        //found = true
                    //}
                //}
                if (found) { 
                    promises.push( new Promise(function(iresolve,ireject) {
                        zip.file(relativePath).async("string").then(function(fileContent) {
                            
                             ////console.log('got ont')
                             iresolve({path:zipEntry.name, data: fileContent})
                        })
                    }).catch(function(e) {
                            
                    }))
                }
            })
            Promise.all(promises).then(function(filesWithContent) {
                resolve(filesWithContent)
            })
        });
    })
}




/**
 *  create entity objects from split sentences
 */
  
function generateIntentSplits(text, intent) {
    const splits = splitSentences(text)

     function extractEntities(text) {
        var entities=[]
        var latestText = text
        var b = balanced('{','}',latestText)
        var limit = 20
        while (b && limit) {
            var entity = { value:b.body, start: b.start, end: b.end, type:cleanEntity(b.body) }
            entities.push(entity)
            latestText = b.pre + b.body + b.post
            b = balanced('{','}',latestText)
            limit --
        }
        return {'id':generateObjectId(), example: latestText, entities: entities, tags: []}
    }
        
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
           expandOptions(text).map(function(line) {
                var intentGen = extractEntities(line)
                intentGen.intent = cleanIntent(intent);
                newSplits.push(intentGen)
           }) 
           //newSplits.push({'id':generateObjectId(), 'example':text,'intent':intent ? intent : '',"entities":[], "tags":[]})
        }
        return null
    })
    return newSplits.sort(sortExampleSplits)
}

/**
 *  create entity objects from split sentences
 * eg synonym_value value value or value value value
 */
function generateEntitySplits(text, entity) {
    console.log(['GEN ent splits',text,entity])
    const splits = splitSentences(text)
    console.log(['GEN ent splits',splits])
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim && text.trim().length > 0) {
            var parts = extractSynonym(text.trim())
            parts[1].map(function(alternative) {
                newSplits.push({'id':generateObjectId(), 'value':alternative, synonym:parts[0], "tags":entity? [entity] : []})
                return null
            })
        }
        return null
    })
    console.log(['GEN final splits',newSplits])
    return newSplits.sort(sortExampleSplits)
}


/**
 *  create entity objects from split sentences
 */
function generateUtteranceSplits(text, tag) {
        ////console.log(['GEN UTT',text,tag])
    const splits = splitSentences(text)
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
            newSplits.push({'id':generateObjectId(), 'value':cleanUtterance(text), synonym:text, "tags":tag ? [tag] : []})
        }
        return null
    })
    return newSplits.sort(sortExampleSplits)
}


/**
 *  create entity objects from split sentences
 */
function generateMycroftUtteranceSplits(text, utterance) {
    var newSplits=[]
    if (utterance) {
        const splits = splitSentences(text)
        //splits.map(function(text,i) {
            if (text && text.trim().length > 0) {
                newSplits.push({'id':generateObjectId(), 'value':cleanUtterance(utterance), synonym:splits.join("\n"), "tags":[]})
            }
            //return null
        //})
    }
    return newSplits.sort(sortExampleSplits)
}
    
function cleanListItem(text) {
    return text ? text.replace(/[^0-9a-z ,]/gi, '') : ''
}

/**
 *  try to extract a synonym from a line of text by splitting on _
 */
function extractSynonym(text) {
    if (text) { 
        var parts = text.split('___')
        if (parts.length > 1) {
           return [parts[0],parts.slice(1)]   
        } else {
            return ['',[text]]
        }
    } else {
        return ['',[]]
    }
}
/**
 *   extract utterances alternatives by splitting on _
 */
function extractAlternatives(text) {
    if (text) { 
        var parts = text.split('___')
        if (parts.length > 1) {
           return [parts[0],parts.slice(1).join("\n")]   
        } else {
            return [text,'']
        }
    } else {
        return ['','']
    }
}

function sortListSplits(a,b) {
    if (a.value < b.value) return -1;  else return 1;
}

function sortExampleSplits(a,b) {
    if (a.example < b.example) return -1 ;else return 1;
}


    function extractLookupFilenamesFromRasaMd(item) {
        var filenames=[]
        if (item.data) {
            item.data.split("##").map(function(intentData,intentKey) {
                var lines = intentData.split("\n")  
                var headerLine = lines[0].trim()
                var dataLines = (lines.length > 1) ? lines.slice(1) : []
                if (headerLine.startsWith("lookup")) {
                     for (var i in dataLines) {
                         filenames.push(dataLines[i])
                     }
                }
            })
        }
    }       

    function generateIntentSplitsForMycroft(item, intentLabel, skillName) {
        var intents = []
        if (item) {
            item.split("\n").map(function(intentExample,intentKey) {
                expandOptions(intentExample).map(function(line) {
                    var intent = extractEntities(line)
                    intent.intent = cleanIntent(intentLabel);
                    intent.skills = (skillName && skillName.trim().length > 0) ? [skillName] : []
                    intents.push(intent)
                })
            })
        }
        return intents
        
        function extractEntities(text) {
            var entities=[]
            var latestText = text
            var b = balanced('{','}',latestText)
            var limit = 20
            while (b && limit) {
                var entity = { value:b.body, start: b.start, end: b.end, type:cleanEntity(b.body) }
                entities.push(entity)
                latestText = b.pre + b.body + b.post
                b = balanced('{','}',latestText)
                limit --
            }
            return {'id':generateObjectId(), example: latestText, entities: entities, tags:[]}
        }

    }


    function generateSplitsFromRasaMd(item, files) {
        var allIntents=[]
        var allEntities={}
        var allRegexps={}
        var allSynonyms={}
        var entitiesFromLookup={}
                                           
        var items = []
        if (item.data) {
            // strip comments
            item.data = item.data.replace(/<\!--.*?-->/g, "");
            
            item.data.split("##").map(function(intentData,intentKey) {
                var lines = intentData.split("\n")  
                var headerLine = lines[0].trim()
                var headerLineParts = headerLine.split(":")
                var section = headerLineParts[0]
                var dataLines = (lines.length > 1) ? lines.slice(1) : []
                
                if (section === "regex") {
                    var regexTitle = cleanRegexp(headerLine.slice(6).trim())
                    var synonyms=[]
                    for (var i in dataLines) {
                        var value = dataLines[i].slice(1).trim() // remove leading -
                        if (regexTitle && value) {
                            synonyms.push(value)
                        }
                    }
                    allRegexps[regexTitle] = {id: generateObjectId(), value: regexTitle, synonym: synonyms.join("\n")}
                    
                } else if (section === "synonym") {
                    var synonym = headerLine.slice(8).trim()
                    for (var i in dataLines) {
                        var value = dataLines[i].slice(1).trim() // remove leading -
                        if (synonym && value) {
                            allSynonyms[synonym] = Array.isArray(allSynonyms[synonym]) ? allSynonyms[synonym]  : []
                            allSynonyms[synonym].push(value)
                        }
                    }
                } else if (section === "lookup") {
                    // NOTE lookups can only be loaded if files are also provided (from zip), reading a single MD/JSON nlu data file will skip the lookups
                    if (files) {
                        var entityType = headerLine.slice(7).trim()
                        for (var i in dataLines) {
                            var path = dataLines[i].trim()
                            // values in list
                            if (path.indexOf("-") === 0) {
                                var value = path.slice(1).trim()
                                if (value && value.trim()) {
                                    if (entitiesFromLookup[value]) {
                                        entitiesFromLookup[value].tags = entitiesFromLookup[value].tags ? uniquifyArray(entitiesFromLookup[value].tags.push(entityType)) : []
                                    } else {
                                        entitiesFromLookup[value] = {tags:  [entityType]}
                                    }
                                }
                            // values in file
                            } else if (path && files[path]) {
                                var entityLines = files[path].split("\n")
                                entityLines.map(function(value) {
                                    if (value && value.trim()) {
                                        if (entitiesFromLookup[value]) {
                                            entitiesFromLookup[value].tags = entitiesFromLookup[value].tags ? uniquifyArray(entitiesFromLookup[value].tags.push(entityType)) : []
                                        } else {
                                            entitiesFromLookup[value] = {tags:  [entityType]}
                                        }
                                    }
                                })
                            } 
                        }
                    }
                } else if (section === "intent") {
                    var intent = headerLine.slice(7)
                    for (var i in dataLines) {
                        try {
                            var entities = {}
                            var example = dataLines[i].slice(1).trim() // remove leading -
                            var intentData = {intent: intent, example: example}
                            if (example.length > 0) {
                                //console.log(example)// extract entities
                                var remainder = example
                                var cleanString = example
                                var parts = balanced('[', ']', remainder)
                                //console.log(['PAREN',parts])
                                var limit=15
                                // loop while there are squre bracket markers in the example sentence
                                // each iteration extracts entities and updates the example sentence
                                while (limit > 0 && parts && parts !== undefined && typeof parts === "object") {
                                    var entity = {}
                                    
                                    limit --
                                    remainder = parts.post
                                    entity.value = parts.body
                                    entity.start = parts.start
                                    entity.end = parts.end
                                    //cleanString = cleanString.slice(0,entity.start) + entity.value + cleanString.slice(entity.end+1)
                                    
                                    // now look for the meta data in either () or {}
                                    var remainderParts = balanced('(',')',parts.post)
                                    var remainderJSONParts = balanced('{','}',parts.post)
                                    //console.log(['PARENEND',entity, cleanString, remainderParts,remainderJSONParts])
                                    
                                    // if there is a metadata section in the remainder both json or () decide which to use first 
                                    if ((remainderParts && remainderParts.body) && (remainderJSONParts && remainderJSONParts.body)) {
                                       
                                        // use the json if it starts first use first (there may be many more from other entities in remainder)
                                        if (remainderJSONParts.start < remainderParts.start) {
                                            try {
                                                var entityTypeParts = JSON.parse("{"+remainderJSONParts.body+"}")
                                                //console.log(['etp',entityTypeParts])
                                                entity.type = cleanEntity(entityTypeParts.entity)
                                                if (entityTypeParts.value && entityTypeParts.value.length > 0) {
                                                    allSynonyms[entityTypeParts.value] = allSynonyms[entityTypeParts.value] ? allSynonyms[entityTypeParts.value] : []
                                                    allSynonyms[entityTypeParts.value].push(entity.value)
                                                    entity.synonym = entityTypeParts.value
                                                }
                                                //entity.type = entityTypeParts.entityTypes
                                                //if (entityTypeParts.synonym && entityTypeParts.synonym.length > 0) {
                                                    //allSynonyms[entityTypeParts.synonym] = allSynonyms[entityTypeParts.synonym] ? allSynonyms[entityTypeParts.synonym] : []
                                                    //allSynonyms[entityTypeParts.synonym].push(entity.value)
                                                    //entity.synonym = entityTypeParts.synonym
                                                //}
                                            } catch (e) {}
                                            cleanString = parts.pre + entity.value + parts.post.slice(0,remainderJSONParts.start) + parts.post.slice(remainderJSONParts.end+1)
                                            //cleanString = cleanString.slice(0,remainderJSONParts.start) + cleanString.slice(remainderJSONParts.end+1)
                                       
                                        // otherwise the () starts first
                                        } else {
                                            var entityTypeParts = remainderParts.body.split(":")
                                            entity.type = cleanEntity(entityTypeParts[0])
                                            if (entityTypeParts.length > 1 && entityTypeParts[1].length > 0) {
                                                allSynonyms[entityTypeParts[1]] = allSynonyms[entityTypeParts[1]] ? allSynonyms[entityTypeParts[1]] : []
                                                allSynonyms[entityTypeParts[1]].push(entity.value)
                                                entity.synonym = entityTypeParts[1]
                                            }
                                           cleanString = parts.pre + entity.value + parts.post.slice(0,remainderParts.start) + parts.post.slice(remainderParts.end+1)
                                            //cleanString = cleanString.slice(0,remainderParts.start) + cleanString.slice(remainderParts.end+1)
                                        } 
                                    
                                    // if there is a json meta data section
                                    } else if (remainderJSONParts && remainderJSONParts.body) {
                                        try {
                                            var entityTypeParts = JSON.parse("{"+remainderJSONParts.body+"}")
                                            //console.log(['JS ent parts',entityTypeParts])
                                            entity.type = cleanEntity(entityTypeParts.entity)
                                            if (entityTypeParts.value && entityTypeParts.value.length > 0) {
                                                allSynonyms[entityTypeParts.value] = allSynonyms[entityTypeParts.value] ? allSynonyms[entityTypeParts.value] : []
                                                allSynonyms[entityTypeParts.value].push(entity.value)
                                                entity.synonym = entityTypeParts.value
                                            }
                                        } catch (e) {}
                                        //cleanString = cleanString.slice(0,remainderJSONParts.start) + cleanString.slice(remainderJSONParts.end+1)
                                        cleanString = parts.pre + entity.value + parts.post.slice(0,remainderJSONParts.start) + parts.post.slice(remainderJSONParts.end+1)
                                    // otherwise use the body as () meta data
                                    } else if (remainderParts && remainderParts.body) {
                                        var entityTypeParts = remainderParts.body.split(":")
                                        //console.log(['OT ent parts',entityTypeParts])
                                        entity.type = cleanEntity(entityTypeParts[0])
                                        if (entityTypeParts.length > 1 && entityTypeParts[1].length > 0) {
                                            allSynonyms[entityTypeParts[1]] = allSynonyms[entityTypeParts[1]] ? allSynonyms[entityTypeParts[1]] : []
                                            allSynonyms[entityTypeParts[1]].push(entity.value)
                                            entity.synonym = entityTypeParts[1]
                                        }
                                        cleanString = parts.pre + entity.value + parts.post.slice(0,remainderParts.start) + parts.post.slice(remainderParts.end+1)
                                        //console.log(['UPDATE CLEANSTRING IN ()  ',cleanString,parts.pre , entity.value , parts.post.slice(0,remainderParts.start),parts.post.slice(remainderParts.end+1)])
                                    } else {
                                        throw new Error('Invalid bracket structure at line '+intentKey)
                                    }
                                    //if (entity.value && entity.type) console.log(['ENTITY',entity, cleanString])
                                    //else console.log(['NOENTITY',entity, cleanString])
                                    //allEntities[entity.type] = entity
                                    intentData.entities = Array.isArray(intentData.entities) ? intentData.entities : []
                                    intentData.entities.push(entity)
                                    if (entity.value) allEntities[entity.value] = {id: generateObjectId(), value: entity.value, synonym: entity.synonym, start: entity.start, end: entity.end, tags: [entity.type]}
                                    parts = balanced('[', ']', cleanString)
                                    //console.log(['PARENEND',parts])
                                }
                                intentData.example = cleanString
                                intentData.skills = (item.name && item.name.trim().length > 0) ? [item.name.trim()] : (item.title && item.title.trim().length > 0 ? [item.title.trim()] : [])
                                
                                allIntents.push(intentData)
                                //console.log(['INTENT',intentData])
                                
                                
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }
                }
                
            })
            
        } 
        //// merge synonyms into all entities
        //console.log(['rasa MD IMPORT MERGE',allSynonyms, entitiesFromLookup, allEntities])
        //// merge entities from lookups
        //Object.keys(entitiesFromLookup).map(function(entity) {
            //var entityData = entitiesFromLookup[entity]
            //if (entityData.value) {
                //if (allEntities[entityData.value]) {
                    //allEntities[entityData.value].tags = allEntities[entityData.value].tags ? uniquifyArray([].concat(allEntities[entityData.value].tags, entityData.tags)) : entityData.tags
                //}
            //}
            //return null
        //}) 
        //Object.keys(allSynonyms).map(function(synonym) {
            //if (Array.isArray(allSynonyms[synonym])) allSynonyms[synonym].map(function(synValue) {
                //if (allEntities[synValue]) {
                    //allEntities[synValue].synonym = synonym
                //} else {
                    //allEntities[synValue] = {id: generateObjectId(), value: synValue, synonym: synonym}
                //}
            //})  
            //return null
        //}) 
   
        var final = {intents: allIntents, regexps: Object.values(allRegexps), entities : Object.values(allEntities)}
        console.log(['rasa MD IMPORT',final,allRegexps])
        return final
    }

    function generateSplitsFromRasaJson(item, files) {
        var allIntents={}
        var allEntities={}
        var allRegexps={}
        var allSynonyms={}
        var entitiesFromLookup={}
        try {
            var json = JSON.parse(item.data)
            console.log(['rasa JSON impORT',json, item.name, item])
            if (json && json.rasa_nlu_data && json.rasa_nlu_data.regex_features) {
                for (var i in json.rasa_nlu_data.regex_features) {
                    var regex = json.rasa_nlu_data.regex_features[i]
                    regex.name = cleanRegexp(regex.name)
                    console.log(['rasa JSON impORT reg',regex])
                    if (regex && regex.name && regex.name.trim().length > 0 && regex.pattern && regex.pattern.trim().length > 0) {
                        allRegexps[regex.name]={'id':generateObjectId(), 'value':regex.name,'synonym': regex.pattern}
                    }
                }
            }
            if (json && json.rasa_nlu_data && json.rasa_nlu_data.entity_synonyms) {
                for (var i in json.rasa_nlu_data.entity_synonyms) {
                    var synonym = json.rasa_nlu_data.entity_synonyms[i]
                    if (synonym.value && synonym.value.trim().length > 0 && synonym.synonyms && synonym.synonyms.length > 0) {
                        allSynonyms[synonym.value] = allSynonyms[synonym.value] ? [].concat(allSynonyms[synonym.value], synonym.synonyms) : []
                        //allSynonyms[synonym.value].push({'id':generateObjectId(), 'value':synonym.value,'synonym': synonym.pattern})
                    }
                }
            }
            if (files && json && json.rasa_nlu_data && json.rasa_nlu_data.lookup_tables) {
                for (var i in json.rasa_nlu_data.lookup_tables) {
                    var lookup = json.rasa_nlu_data.lookup_tables[i]
                    var entityType = cleanEntity(lookup.name)
                    var path = lookup.elements.trim()
                    if (path.indexOf("-") === 0) {
                        var value = path.slice(1).trim()
                        if (value && value.trim()) {
                            if (entitiesFromLookup[value]) {
                                entitiesFromLookup[value].tags = entitiesFromLookup[value].tags ? uniquifyArray(entitiesFromLookup[value].tags.push(entityType)) : []
                            } else {
                                entitiesFromLookup[value] = {tags:  [entityType]}
                            }
                        }
                    // values in file
                    } else if (path && files[path]) {
                        var entityLines = files[path].split("\n")
                        entityLines.map(function(value) {
                            if (value && value.trim()) {
                                if (entitiesFromLookup[value]) {
                                    entitiesFromLookup[value].tags = entitiesFromLookup[value].tags ? uniquifyArray(entitiesFromLookup[value].tags.push(entityType)) : []
                                } else {
                                    entitiesFromLookup[value] = {tags:  [entityType]}
                                }
                            }
                        })
                    } 
                
                }
            }
 
            if (json && json.rasa_nlu_data && json.rasa_nlu_data.common_examples) {
                for (var i in json.rasa_nlu_data.common_examples) {
                    var entity = json.rasa_nlu_data.common_examples[i]
                    //console.log(entity)
                    var cleanEntities = entity.entities ? entity.entities.map(function(el,j) { return {type:cleanEntity(el.entity), value:el.value, start:el.start, end:el.end} }) : []
                    // entities
                    cleanEntities.map(function(entity) {
                        if (allEntities[entity.value]) {
                            allEntities[entity.value].tags = allEntities[entity.value].tags ? uniquifyArray([].concat(allEntities[entity.value].tags, [entity.type])) : [entity.type]
                        } else {
                            allEntities[entity.value] = {id: generateObjectId(), value: entity.value, start: entity.start, stop: entity.stop,  tags: [entity.type]}
                        }
                        //= allEntities[entity.value] ? allEntities[entity.value] : {}
                        //allEntities[entity.value].
                    })
                    //if (entity.text && entity.text.trim()) {
                        allIntents[entity.text] = {'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, tags:[], skills: (item.name && item.name.trim().length > 0) ? [item.name.trim()] : (item.title && item.title.trim().length > 0 ? [item.title.trim()] : [])}
                    //}
                }
            }
            //console.log(['rasa json IMPORT INTENTS',allIntents])
        } catch(e) {
            console.log(e)
        }
       
        // merge synonyms into all entities
        //console.log(['rasa MD IMPORT MERGE',allSynonyms, entitiesFromLookup, allEntities])
        // merge entities from lookups
        Object.keys(entitiesFromLookup).map(function(entity) {
            var entityData = entitiesFromLookup[entity]
            if (entityData.value) {
                if (allEntities[entityData.value]) {
                    allEntities[entityData.value].tags = allEntities[entityData.value].tags ? uniquifyArray([].concat(allEntities[entityData.value].tags, entityData.tags)) : entityData.tags
                }
            }
            return null
        }) 
        Object.keys(allSynonyms).map(function(synonym) {
            if (Array.isArray(allSynonyms[synonym])) allSynonyms[synonym].map(function(synValue) {
                if (allEntities[synValue]) {
                    allEntities[synValue].synonym = synonym
                } else {
                    allEntities[synValue] = {id: generateObjectId(), value: synValue, synonym: synonym}
                }
            })  
            return null
        }) 
   
        var final = {intents: Object.values(allIntents), regexps: Object.values(allRegexps), entities : Object.values(allEntities)}
        //console.log(['rasa MD IMPORT',final])
        return final
    }

    function generateSplitsFromJovoJson(item) {
        var items = []
        try {
            var json = JSON.parse(item.data)
            console.log(['JOVO IMPORT',json,item.name])
            if (json && json.invocation && json.intents) {
                json.intents.map(function(intent) {
                    if (intent && intent.phrases) {
                        intent.phrases.map(function(phrase) {
                            //console.log(['JOVO IMPORT',phrase])
                            if (phrase && phrase.trim().length > 0)  {
                                 var entities = []
                                if (intent.inputs) {
                                    for (var inputKey in intent.inputs) {
                                       var input = intent.inputs[inputKey]
                                       var inputName = cleanEntity(input.name)
                                       ////console.log([phrase,input.name])
                                       const markerStart = phrase.indexOf("{"+inputName+"}")
                                       if (markerStart !== -1)  {
                                           phrase = phrase.replace("{"+inputName+"}",inputName)
                                       }
                                       var entityi = {type:input.name, value:inputName , start: markerStart , end: markerStart + input.name.length  }
                                       entities.push(entityi)
                                       return null
                                    }
                                }
                                //console.log(['JOVO IMPORT pushg item',intent.name])
                                
                                items.push({'id':generateObjectId(), 'example':phrase.trim(),'intent':cleanIntent(intent.name),"entities": entities, tags: [], skills: (item.name && item.name.trim().length > 0) ? [item.name.trim()] : []})
                                //console.log(['JOVO IMPORT pushed item',JSON.parse(JSON.stringify(items))])
                                
                            }
                            return null
                        })
                    }
                    return null
                })
                //console.log(['JOVO done IMPORT',items])
            }
        } catch(e) {}
        return {intents: items}
    }   
    
    
    
    
    function generateSplitsFromRasaYml(item, files) {
        //console.log('FROM YML');
        var allIntents=[]
        var allEntities={}
        var allRegexps={}
        var allSynonyms={}
        var entitiesFromLookup={}
        
        try {
          const doc = yaml.safeLoad(item.data);
          //console.log(['yaml rasa',doc,parseFloat(doc.version)]);
          if (doc.version && parseFloat(doc.version) >=  2) {
              //console.log('v2');
              if (doc.nlu || doc.stories || doc.rules) {
                  //console.log('has element');
                  //resolve({type:'rasa.yml'})
                  if (doc.nlu) {
                      doc.nlu.map(function(nluData) {
                          
                          //console.log(['has nlu',nluData.examples]);
                        if (nluData.intent && nluData.examples) {
                            //console.log('has nlu ex');
                            var intent = cleanIntent(nluData.intent)
                            var examples = nluData.examples.split("\n")
                            for (var i in examples) {
                                var entities = {}
                                var example = examples[i].trim() // remove leading -.slice(1)
                                if (example.indexOf('-') === 0) example = example.slice(1).trim()
                                var intentData = {intent: intent, example: example}
                                if (example.length > 0) {
                                    //console.log(example)// extract entities
                                    var remainder = example
                                    var cleanString = example
                                    var parts = balanced('[', ']', remainder)
                                    //console.log(['PAREN',parts])
                                    var limit=15
                                    // loop while there are squre bracket markers in the example sentence
                                    // each iteration extracts entities and updates the example sentence
                                    while (limit > 0 && parts && parts !== undefined && typeof parts === "object") {
                                        var entity = {}
                                        
                                        limit --
                                        remainder = parts.post
                                        entity.value = parts.body
                                        entity.start = parts.start
                                        entity.end = parts.end
                                        //cleanString = cleanString.slice(0,entity.start) + entity.value + cleanString.slice(entity.end+1)
                                        
                                        // now look for the meta data in either () or {}
                                        var remainderParts = balanced('(',')',parts.post)
                                        var remainderJSONParts = balanced('{','}',parts.post)
                                        //console.log(['PARENEND',entity, cleanString, remainderParts,remainderJSONParts])
                                        
                                        // if there is a metadata section in the remainder both json or () decide which to use first 
                                        if ((remainderParts && remainderParts.body) && (remainderJSONParts && remainderJSONParts.body)) {
                                           
                                            // use the json if it starts first use first (there may be many more from other entities in remainder)
                                            if (remainderJSONParts.start < remainderParts.start) {
                                                try {
                                                    var entityTypeParts = JSON.parse("{"+remainderJSONParts.body+"}")
                                                    //console.log(['etp',entityTypeParts])
                                                    entity.type = cleanEntity(entityTypeParts.entity)
                                                    if (entityTypeParts.value && entityTypeParts.value.length > 0) {
                                                        allSynonyms[entityTypeParts.value] = allSynonyms[entityTypeParts.value] ? allSynonyms[entityTypeParts.value] : []
                                                        allSynonyms[entityTypeParts.value].push(entity.value)
                                                        entity.synonym = entityTypeParts.value
                                                    }
                                                    //entity.type = entityTypeParts.entityTypes
                                                    //if (entityTypeParts.synonym && entityTypeParts.synonym.length > 0) {
                                                        //allSynonyms[entityTypeParts.synonym] = allSynonyms[entityTypeParts.synonym] ? allSynonyms[entityTypeParts.synonym] : []
                                                        //allSynonyms[entityTypeParts.synonym].push(entity.value)
                                                        //entity.synonym = entityTypeParts.synonym
                                                    //}
                                                } catch (e) {}
                                                cleanString = parts.pre + entity.value + parts.post.slice(0,remainderJSONParts.start) + parts.post.slice(remainderJSONParts.end+1)
                                                //cleanString = cleanString.slice(0,remainderJSONParts.start) + cleanString.slice(remainderJSONParts.end+1)
                                           
                                            // otherwise the () starts first
                                            } else {
                                                var entityTypeParts = remainderParts.body.split(":")
                                                entity.type = cleanEntity(entityTypeParts[0])
                                                if (entityTypeParts.length > 1 && entityTypeParts[1].length > 0) {
                                                    allSynonyms[entityTypeParts[1]] = allSynonyms[entityTypeParts[1]] ? allSynonyms[entityTypeParts[1]] : []
                                                    allSynonyms[entityTypeParts[1]].push(entity.value)
                                                    entity.synonym = entityTypeParts[1]
                                                }
                                               cleanString = parts.pre + entity.value + parts.post.slice(0,remainderParts.start) + parts.post.slice(remainderParts.end+1)
                                                //cleanString = cleanString.slice(0,remainderParts.start) + cleanString.slice(remainderParts.end+1)
                                            } 
                                        
                                        // if there is a json meta data section
                                        } else if (remainderJSONParts && remainderJSONParts.body) {
                                            try {
                                                var entityTypeParts = JSON.parse("{"+remainderJSONParts.body+"}")
                                                //console.log(['JS ent parts',entityTypeParts])
                                                entity.type = cleanEntity(entityTypeParts.entity)
                                                if (entityTypeParts.value && entityTypeParts.value.length > 0) {
                                                    allSynonyms[entityTypeParts.value] = allSynonyms[entityTypeParts.value] ? allSynonyms[entityTypeParts.value] : []
                                                    allSynonyms[entityTypeParts.value].push(entity.value)
                                                    entity.synonym = entityTypeParts.value
                                                }
                                            } catch (e) {}
                                            //cleanString = cleanString.slice(0,remainderJSONParts.start) + cleanString.slice(remainderJSONParts.end+1)
                                            cleanString = parts.pre + entity.value + parts.post.slice(0,remainderJSONParts.start) + parts.post.slice(remainderJSONParts.end+1)
                                        // otherwise use the body as () meta data
                                        } else if (remainderParts && remainderParts.body) {
                                            var entityTypeParts = remainderParts.body.split(":")
                                            //console.log(['OT ent parts',entityTypeParts])
                                            entity.type = cleanEntity(entityTypeParts[0])
                                            if (entityTypeParts.length > 1 && entityTypeParts[1].length > 0) {
                                                allSynonyms[entityTypeParts[1]] = allSynonyms[entityTypeParts[1]] ? allSynonyms[entityTypeParts[1]] : []
                                                allSynonyms[entityTypeParts[1]].push(entity.value)
                                                entity.synonym = entityTypeParts[1]
                                            }
                                            cleanString = parts.pre + entity.value + parts.post.slice(0,remainderParts.start) + parts.post.slice(remainderParts.end+1)
                                            //console.log(['UPDATE CLEANSTRING IN ()  ',cleanString,parts.pre , entity.value , parts.post.slice(0,remainderParts.start),parts.post.slice(remainderParts.end+1)])
                                        } else {
                                            throw new Error('Invalid bracket structure at intent '+doc.nlu.intent)
                                        }
                                        //if (entity.value && entity.type) console.log(['ENTITY',entity, cleanString])
                                        //else console.log(['NOENTITY',entity, cleanString])
                                        //allEntities[entity.type] = entity
                                        intentData.entities = Array.isArray(intentData.entities) ? intentData.entities : []
                                        intentData.entities.push(entity)
                                        if (entity.value) allEntities[entity.value] = {id: generateObjectId(), value: entity.value, synonym: entity.synonym, start: entity.start, end: entity.end, tags: [entity.type]}
                                        parts = balanced('[', ']', cleanString)
                                        //console.log(['PARENEND',parts])
                                    }
                                    intentData.example = cleanString
                                    intentData.skills = (item.name && item.name.trim().length > 0) ? [item.name.trim()] : []
                                    allIntents.push(intentData)
                                    //console.log(['INTENT',intentData])
                                    
                                    
                                }
                            }
                        }
                        if (nluData.regex && nluData.examples) {
                            var regexTitle = cleanRegexp(nluData.regex)
                            var examples = nluData.examples.split("\n")
                            for (var i in examples) {
                                var value = examples[i].trim()
                                if (value.indexOf('-') === 0) value = value.slice(1).trim()
                                if (regexTitle && value) {
                                    allRegexps[regexTitle] = Array.isArray(allRegexps[regexTitle]) ? allRegexps[regexTitle]  : []
                                    allRegexps[regexTitle].push(value)
                                }
                            }
                        }
                        if (nluData.synonym && nluData.examples) {
                            var synonym = nluData.synonym
                            var examples = nluData.examples.split("\n")
                            for (var i in examples) {
                                var value = examples[i].trim()
                                if (value.indexOf('-') === 0) value = value.slice(1).trim()
                                if (synonym && value) {
                                    allSynonyms[synonym] = Array.isArray(allSynonyms[synonym]) ? allSynonyms[synonym]  : []
                                    allSynonyms[synonym].push(value)
                                }
                            }
                        }
                        if (nluData.lookup && nluData.examples) {
                            var entityType = nluData.lookup
                            var examples = nluData.examples.split("\n")
                            examples.map(function(value) {
                                if (value && value.trim()) {
                                    if (value.indexOf('-') === 0) value = cleanEntity(value.slice(1).trim())
                                    if (entitiesFromLookup[value]) {
                                        entitiesFromLookup[value].tags = entitiesFromLookup[value].tags ? uniquifyArray(entitiesFromLookup[value].tags.push(entityType)) : []
                                    } else {
                                        entitiesFromLookup[value] = {tags:  [entityType]}
                                    }
                                }
                            })    
                        }
                     })
                  }
              }
          } 
        } catch (e) {
          console.log(e);
           
        }
        
        
        var final = {intents: Object.values(allIntents), regexps: Object.keys(allRegexps).map(function(regexTitle) {
                var allValues = Array.isArray(allRegexps[regexTitle]) ? allRegexps[regexTitle].join("\n") : ''
                return {id: generateObjectId(), value: regexTitle, synonym: allValues}
            }), entities : Object.values(allEntities)}
        //console.log(['rasa MD IMPORT',final])
        return final
    }

export default function useImportUtils() { return  {unzip, splitSentences, generateIntentSplits, generateEntitySplits, generateUtteranceSplits, generateMycroftUtteranceSplits,  cleanListItem, extractSynonym, sortListSplits, sortExampleSplits, detectFileType, generateSplitsFromJovoJson, generateSplitsFromRasaJson, generateSplitsFromRasaMd, generateIntentSplitsForMycroft, generateSplitsFromRasaYml}}
