import JSZip from 'jszip'
import parenthesis from 'parenthesis'
import {generateObjectId} from './utils'

var balanced = require('balanced-match');


    function detectFileType(item) {
        return new Promise(function(resolve,reject) {
            console.log(['DETECT FILE TYPE',item])
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
                        console.log( zipEntry.name)
                        // rasa
                        if (zipEntry.name.indexOf('/domain.yml') !== -1) found['rasa_domain'] = true 
                        if (zipEntry.name.indexOf('/data/nlu.md') !== -1) found['rasa_data'] = true
                        // jovo
                        if (zipEntry.name.indexOf('/project.js') !== -1) found['jovo_project'] = true
                        if (zipEntry.name.indexOf('/models/en-US.js') !== -1) found['jovo_lang'] = true
                        // mycroft
                        if (zipEntry.name.indexOf('/__init__.py') !== -1) found['mycroft_index'] = true
                        if (zipEntry.name.indexOf('/vocab') !== -1) found['mycroft_vocab'] = true
                        console.log(['FOUND',found])
                    });
                    console.log(['FOUND',found])
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
                    //console.log('NOT ZIP')
                    //console.log(e)
                    
                    if (item.data && item.data.indexOf('## intent:') !== -1) {
                        resolve({type: 'rasa.markdown'})
                    } else {
                        resolve({type: 'text'})
                    }
                });
                
            }  
        })
               
    }


/**
 *  unzip a file and extract the content for files matching paths found in pathFilters array
 */
function unzip(content,pathFilters) {
    return new Promise (function( resolve, reject) {
        var zip = new JSZip();
        zip.loadAsync(content)
        .then(function(zip) {
            var promises=[]
            zip.forEach(function (relativePath, zipEntry) {
                //console.log(relativePath,zipEntry)
                var found = false
                for (var j in pathFilters) {
                    var pathFilter = pathFilters[j]
                    if ( zipEntry.name.indexOf(pathFilter) !== -1) { 
                        found = true
                    }
                }
                if (found) { 
                    promises.push( new Promise(function(iresolve,ireject) {
                        zip.file(relativePath).async("string").then(function(fileContent) {
                            
                             //console.log('got ont')
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
 *  create array by splitting on newline and fullstop
 */
function splitSentences(text) {
      var final = []
      if (text) {
          // split by newline and full stop
         var splits = text.split('\n').join('::::').split('.').join('::::').split('::::') //.map(function(value) { return value.trim()})
        // trim all splits
        for (var splitText in splits) {
            if(splitText.trim().length > 0) final.push(splits[splitText])
        }
     }
     return final;
}

/**
 *  create entity objects from split sentences
 */
function generateIntentSplits(text, intent) {
    const splits = splitSentences(text)
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
         newSplits.push({'id':generateObjectId(), 'example':text,'intent':intent ? intent : '',"entities":[], "tags":[]})
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
    const splits = splitSentences(text)
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
            var parts = extractSynonym(text.trim())
            parts[1].map(function(alternative) {
                newSplits.push({'id':generateObjectId(), 'value':alternative, synonym:parts[0], "tags":entity? [entity] : []})
                return null
            })
        }
        return null
    })
    return newSplits.sort(sortExampleSplits)
}


/**
 *  create entity objects from split sentences
 */
function generateUtteranceSplits(text, tag) {
        //console.log(['GEN UTT',text,tag])
    const splits = splitSentences(text)
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
            newSplits.push({'id':generateObjectId(), 'value':text, synonym:'', "tags":tag ? [tag] : []})
        }
        return null
    })
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
    
    function generateIntentSplitsForMycroftHandleBody(pre,post, parts, intent) {
        var intents = []
        console.log(['GEN handle',parts])
        if (parts && parts.body) {
            var innerParts = balanced('(',')',parts.body)
            var innerPartsPost = balanced('(',')',parts.post)
            if (innerParts) console.log(['RECURSE',innerParts])
            if (innerPartsPost) console.log(['RECURSEPOST',innerPartsPost])
            if (innerPartsPost) {
                // recurse with parts.post
                //intents = [].concat(intents, generateIntentSplitsForMycroftHandleBody(pre+parts.pre+innerPartsPost.pre,innerPartsPost.post+parts.post+post,innerPartsPost, intent))
            } else {
                var options = parts.post.split("|")
                console.log(['NP',parts])
                options.map(function(option) {
                    if (option && option.length) {
                        intents.push({intent: intent, example:pre + parts.pre  + option + parts.post + post})
                    }
                });
            }    
            //if (innerParts) {
                //// recurse with parts.body
                //intents = [].concat(intents, generateIntentSplitsForMycroftHandleBody(pre+innerParts.pre,innerParts.post+post,innerParts, intent))
            //} else {
                //var options = parts.body.split("|")
                //console.log(['NP',parts])
                //options.map(function(option) {
                    //if (option && option.length) {
                        //intents.push({intent: intent, example:pre + parts.pre  + option + parts.post + post})
                    //}
                //});
            //}
            

        }
        return intents
    }
                    

    function generateIntentSplitsForMycroft(item, intentLabel) {

            console.log(['GEN MYC',item])
            var intents = []
            if (item) {
                console.log(['GEN MYC d',item])
                item.split("\n").map(function(intentExample,intentKey) {
                    expandOptions(intentExample).map(function(line) {
                        var intent = extractEntities(line)
                        intent.intent = intentLabel;
                        intents.push(intent)
                    })
                })
            }
            console.log(['MY IMP COMPL',intents])  
            return intents
        

        //var t = "(i|we) want to (see (tigers|lions)|watch (penguins|monkeys)) AT the zoo"
        //return 
        
        
        function multiplyArrays(a,b) {
            var results=[]
            a.map(function(aval) {
                  b.map(function(bval) {
                      results.push(aval + bval)
                  })
            })
            return results
        }

        function uniquifyArray(a) {
            if (Array.isArray(a)) {
                var index = {}
                a.map(function(value) {
                    index[value] = true 
                    return null
                })
                return Object.keys(index)
            } else {
                return []
            }
        }

        function expandOptions(text) {
            var options = []
            var b = balanced('(',')',text)
            if (b && b.body) {
                var innerOptions = null
                var ib = balanced('(',')',b.body)
                if (ib) {
                    innerOptions = expandOptions(b.body)
                } else {
                    innerOptions = b.body.split("|")
                }
                innerOptions = uniquifyArray(innerOptions)
                var sentences = uniquifyArray(multiplyArrays(multiplyArrays([b.pre],innerOptions),[b.post]))
                sentences.map(function(sentence) {
                   options=[].concat(options,expandOptions(sentence))  
                })
            } else {
                options = text.split("|")
            }
            return uniquifyArray(options)
        }

        function extractEntities(text) {
            var entities=[]
            var latestText = text
            var b = balanced('{','}',latestText)
            var limit = 20
            while (b && limit) {
                var entity = { value:b.body, start: b.start, end: b.end, type:b.body }
                entities.push(entity)
                latestText = b.pre + b.body + b.post
                b = balanced('{','}',latestText)
                limit --
            }
            return {example: latestText, entities: entities}
        }

    }


    function generateSplitsFromRasaMd(item, files) {
        var allIntents=[]
        //var allEntities={}
        var allRegexps={}
        var allSynonyms={}
        var entitiesFromLookup={}
                                           
        var items = []
        if (item.data) {
            item.data.split("##").map(function(intentData,intentKey) {
                var lines = intentData.split("\n")  
                var headerLine = lines[0].trim()
                var dataLines = (lines.length > 1) ? lines.slice(1) : []
                
                if (headerLine.startsWith("regex")) {
                    var regexTitle = headerLine.slice(6).trim()
                    for (var i in dataLines) {
                        var value = dataLines[i].slice(1).trim() // remove leading -
                        if (regexTitle && value) {
                            allRegexps[regexTitle] = Array.isArray(allRegexps[regexTitle]) ? allRegexps[regexTitle]  : []
                            allRegexps[regexTitle].push(value)
                        }
                    }
                } else if (headerLine.startsWith("synonym")) {
                    var synonym = headerLine.slice(8).trim()
                    for (var i in dataLines) {
                        var value = dataLines[i].slice(1).trim() // remove leading -
                        if (synonym && value) {
                            allSynonyms[synonym] = Array.isArray(allSynonyms[synonym]) ? allSynonyms[synonym]  : []
                            allSynonyms[synonym].push(value)
                        }
                    }
                } else if (headerLine.startsWith("lookup")) {
                    // NOTE lookups can only be loaded if files are also provided (from zip), reading a single MD/JSON nlu data file will skip the lookups
                    if (files) {
                        var entityType = headerLine.slice(7).trim()
                        for (var i in dataLines) {
                            var path = dataLines[i].trim()
                            if (path && files[path]) {
                                var entityLines = files[path].split("\n")
                                entityLines.map(function(value) {
                                    if (value && value.trim()) {
                                        if (entitiesFromLookup[value]) {
                                            entitiesFromLookup[value].tags = entitiesFromLookup[value].tags ? entitiesFromLookup[value].tags : []
                                        } else {
                                            entitiesFromLookup[value] = {tags:  [entityType]}
                                        }
                                    }
                                })
                            } 
                        }
                    }
                } else if (headerLine.startsWith("intent")) {
                    
                    var intent = headerLine.slice(7)
                    for (var i in dataLines) {
                        var entities = {}
                        var example = dataLines[i].slice(1).trim() // remove leading -
                        var intentData = {intent: intent, example: example}
                        if (example.length > 0) {
                            console.log(example)// extract entities
                            var remainder = example
                            var cleanString = example
                            var parts = balanced('[', ']', remainder)
                            //console.log(['PAREN',parts])
                            var limit=10
                            while (limit > 0 && parts && parts !== undefined && typeof parts === "object") {
                                var entity = {}
                            
                                limit --
                                remainder = parts.post
                                entity.value = parts.body
                                entity.start = parts.start
                                entity.end = parts.end
                                //cleanString = cleanString.slice(0,entity.start) + entity.value + cleanString.slice(entity.end+1)
                                
                                var remainderParts = balanced('(',')',parts.post)
                                var remainderJSONParts = balanced('{','}',parts.post)
                                //console.log(['PARENEND',entity, cleanString, remainderParts])
                                if ((remainderParts && remainderParts.body) && (remainderJSONParts && remainderJSONParts.body)) {
                                    // both in remainder so use earliest start
                                    if (remainderJSONParts.start < remainderParts.start) {
                                        try {
                                            var entityTypeParts = JSON.parse("{"+remainderJSONParts.body+"}")
                                            entity.type = entityTypeParts.entityTypes
                                            if (entityTypeParts.synonym && entityTypeParts.synonym.length > 0) {
                                                allSynonyms[entityTypeParts.synonym] = allSynonyms[entityTypeParts.synonym] ? allSynonyms[entityTypeParts.synonym] : []
                                                allSynonyms[entityTypeParts.synonym].push(entity.value)
                                                entity.synonym = entityTypeParts.synonym
                                            }
                                        } catch (e) {}
                                        //cleanString = cleanString.slice(0,remainderJSONParts.start) + cleanString.slice(remainderJSONParts.end+1)
                                    } else {
                                        var entityTypeParts = remainderParts.body.split(":")
                                        entity.type = entityTypeParts[0]
                                        if (entityTypeParts.length > 1 && entityTypeParts[1].length > 0) {
                                            allSynonyms[entityTypeParts[1]] = allSynonyms[entityTypeParts[1]] ? allSynonyms[entityTypeParts[1]] : []
                                            allSynonyms[entityTypeParts[1]].push(entity.value)
                                            entity.synonym = entityTypeParts[1]
                                        }
                                        //cleanString = cleanString.slice(0,remainderParts.start) + cleanString.slice(remainderParts.end+1)
                                    } 
                                    
                                
                                } else if (remainderJSONParts && remainderJSONParts.body) {
                                    try {
                                            var entityTypeParts = JSON.parse("{"+remainderJSONParts.body+"}")
                                            entity.type = entityTypeParts.entityTypes
                                            if (entityTypeParts.synonym && entityTypeParts.synonym.length > 0) {
                                                allSynonyms[entityTypeParts.synonym] = allSynonyms[entityTypeParts.synonym] ? allSynonyms[entityTypeParts.synonym] : []
                                                allSynonyms[entityTypeParts.synonym].push(entity.value)
                                                entity.synonym = entityTypeParts.synonym
                                            }
                                        } catch (e) {}
                                        //cleanString = cleanString.slice(0,remainderJSONParts.start) + cleanString.slice(remainderJSONParts.end+1)
                                } else if (remainderParts && remainderParts.body) {
                                    var entityTypeParts = remainderParts.body.split(":")
                                    entity.type = entityTypeParts[0]
                                    if (entityTypeParts.length > 1 && entityTypeParts[1].length > 0) {
                                        allSynonyms[entityTypeParts[1]] = allSynonyms[entityTypeParts[1]] ? allSynonyms[entityTypeParts[1]] : []
                                        allSynonyms[entityTypeParts[1]].push(entity.value)
                                        entity.synonym = entityTypeParts[1]
                                    }
                                    cleanString = parts.pre + entity.value + parts.post.slice(0,remainderParts.start) + parts.post.slice(remainderParts.end+1)
                                } else {
                                    throw new Error('Invalid bracket structure at line '+intentKey)
                                }
                                console.log(['ENTITY',entity, cleanString])
                                //allEntities[entity.type] = entity
                                intentData.entities = Array.isArray(intentData.entities) ? intentData.entities : []
                                intentData.entities.push(entity)
                                parts = balanced('[', ']', remainder)
                            }
                            intentData.example = cleanString
                            allIntents.push(intentData)
                            console.log(['INTENT',intentData])
                            
                            
                        }
                    }
                }
                
            })
            
           
            
        } 
        console.log(['rasa json IMPORT',allIntents, allRegexps, allSynonyms, entitiesFromLookup])
        return {intents: allIntents}
    }

    function generateSplitsFromRasaJson(item) {
        var items = []
        try {
            var json = JSON.parse(item.data)
            if (json && json.rasa_nlu_data && json.rasa_nlu_data.common_examples) {
                for (var i in json.rasa_nlu_data.common_examples) {
                    var entity = json.rasa_nlu_data.common_examples[i]
                    var cleanEntities = entity.entities && entity.entities.map(function(el,j) { return {type:el.entity, value:el.value, start:el.start, end:el.end} })
                    if (entity.text && entity.text.trim().length > 0) {
                        items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, tags:[]})
                    }
                }
            }
            console.log(['rasa json IMPORT',items])
        } catch(e) {}
        return {intents: items}
    }


    function generateSplitsFromJovoJson(item) {
        var items = []
        try {
            var json = JSON.parse(item.data)
            console.log(['JOVO IMPORT',json])
            if (json && json.invocation && json.intents) {
                json.intents.map(function(intent) {
                    if (intent && intent.phrases) {
                        intent.phrases.map(function(phrase) {
                            console.log(['JOVO IMPORT',phrase])
                            if (phrase && phrase.trim().length > 0)  {
                                 var entities = []
                                if (intent.inputs) {
                                    for (var inputKey in intent.inputs) {
                                       var input = intent.inputs[inputKey]
                                       //console.log([phrase,input.name])
                                       const markerStart = phrase.indexOf("{"+input.name+"}")
                                       if (markerStart !== -1)  {
                                           phrase = phrase.replace("{"+input.name+"}",input.name)
                                       }
                                       var entityi = {type:input.name, value:input.name , start: markerStart , end: markerStart + input.name.length  }
                                       entities.push(entityi)
                                       return null
                                    }
                                }
                                console.log(['JOVO IMPORT pushg item',intent.name])
                                
                                items.push({'id':generateObjectId(), 'example':phrase.trim(),'intent':intent.name,"entities": entities, tags: []})
                                console.log(['JOVO IMPORT pushed item',JSON.parse(JSON.stringify(items))])
                                
                            }
                            return null
                        })
                    }
                    return null
                })
                console.log(['JOVO done IMPORT',items])
            }
        } catch(e) {}
        return {intents: items}
    }   

export default function useImportUtils() { return  {unzip, splitSentences, generateIntentSplits, generateEntitySplits, generateUtteranceSplits, cleanListItem, extractSynonym, sortListSplits, sortExampleSplits, detectFileType, generateSplitsFromJovoJson, generateSplitsFromRasaJson, generateSplitsFromRasaMd, generateIntentSplitsForMycroft}}
