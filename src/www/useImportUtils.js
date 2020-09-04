import JSZip from 'jszip'

import {generateObjectId} from './utils'



    function detectFileType(item) {
        return new Promise(function(resolve,reject) {
            console.log(['DETECT FILE TYPE',item])
            try {
                var json = JSON.parse(item.data)
                // RASA JSON FORMAT
                if (json && json.rasa_nlu_data && json.rasa_nlu_data.common_examples) {
                    resolve( {type: 'rasa.json'})
                // JOVO JSON { "invocation": "my test app", "intents": [{"name": "HelloWorldIntent","phrases": ["hello","say hello"]}] } ,
                } else if (json && json.invocation && json.intents) {
                    resolve({type: 'jovo.lang'})
                } else if (json && json.title && json.intents && json.entities && json.id) {
                    resolve({type: 'opennlu.skill'})
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
 */
function generateEntitySplits(text, entity) {
    const splits = splitSentences(text)
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
            var parts = extractSynonym(text.trim())
            parts[1].map(function(alternative) {
                newSplits.push({'id':generateObjectId(), 'value':alternative, synonym:parts[0], "tags":[entity]})
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
function generateUtteranceSplits(text, utterance) {
    const splits = splitSentences(text)
    var newSplits=[]
    splits.map(function(text,i) {
        if (text && text.trim().length > 0) {
            var parts=[]
            if (utterance) {
                parts = text.split('_')
                newSplits.push({'id':generateObjectId(), 'value':utterance, synonym:parts.join("\n"), "tags":[]})
            } else {
                parts = extractAlternatives(text.trim())
                newSplits.push({'id':generateObjectId(), 'value':parts[0], synonym:parts[1], "tags":[]})
            }
        }
        return null
    })
    return newSplits.sort(sortExampleSplits)
}


    
function cleanListItem(text) {
    return text ? text.replace(/[^0-9a-z ,]/gi, '') : ''
}

/**
 *  try to extract a synonym from a line of text by splitting on :
 */
function extractSynonym(text) {
    if (text) { 
        var parts = text.split('_')
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
 *   extract utterances alternatives by splitting on :
 */
function extractAlternatives(text) {
    if (text) { 
        var parts = text.split('_')
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

   

export default function useImportUtils() { return  {unzip, splitSentences, generateIntentSplits, generateEntitySplits, generateUtteranceSplits, cleanListItem, extractSynonym, sortListSplits, sortExampleSplits, detectFileType}}
