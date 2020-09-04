import {splitSentences, generateObjectId} from './utils'
import JSZip from 'jszip'



function importSkill(item) {
    console.log(['importSkill',item])
    // save skill
    // merge lists, utterances, regexps
}

function importMycroft(item) {
    console.log(['importMycroft',item])
    // vocab/en-US/*.intent, *.entity
    // vocab/en-US/*.dialog -> utterances
}

function importRASA(item) {
    console.log(['importRASA',item])
    // intents and entities
    if (item.fileType === "rasa.json") {
        
    } else if (item.fileType === "rasa.markdown") {
        
    } else if (item.fileType === "rasa.zip") {
        // plus domain -> slots, actions, utterances
        // plus data/lookups/* -> entities
    }
}

function importJOVO(item) {
    console.log(['importJOVO',item])
    // intents and entities
    if (item.fileType === "jovo.lang") {
        
    } else if (item.fileType === "jovo.zip") {
        
    }
}

function importEntities(item) {
    console.log(['importEntities',item])
    if (item.fileType === "text") {
        
    } else if (item.fileType === "opennlu.lists") {
        
    }
}

function importUtterances(item) {
    console.log(['importUtterances',item])
    if (item.fileType === "text") {
        
    } else if (item.fileType === "opennlu.utterances") {
        
    }
}

function importIntentsAndEntities(item) {
    console.log(['importIntentsAndEntities',item])
}




function parseLists(text,listName) {
        var key = listName ? listName : '___'
        // plain text
        function generateSplits() {
            var newTextSplits=[]
            const splits = splitSentences(text)
            splits.map(function(textInner,i) {
                var [synonym, value] = extractSynonym(textInner)
                value = value.trim().replace(/[^0-9a-z ]/gi, '')
                if (value && value.length > 0) {
                    newTextSplits.push({'id':generateObjectId(), 'value':value,'synonym':synonym})
                }
                return null
            })
            return newTextSplits.sort(sortListSplits);
        }
        try {
            var json = JSON.parse(text)
            //  JSON ARRAY FORMAT
            if (Array.isArray(json)) {
                // value and optional synonyn
                var lists = {}
                //console.log(['LISTS',lists])
                if (json.length > 0 && json[0].value && json[0].value.trim().length > 0) {
                    for (var i in json) {
                        var entity = json[i]
                        if (entity.value && entity.value.trim().length > 0) {
                            var listKey = entity.list ? entity.list : key
                            //console.log(['reset push',listKey,lists])
                            if (!lists[listKey]  ) {
                                lists[listKey] = []
                            }
                            lists[listKey].push({'id':generateObjectId(), 'value':cleanListItem(entity.value),'synonym':entity.synonym})
                        }
                    }
                    // now sort and uniquify each list
                    
                    Object.keys(lists).map(function(listKey) {
                        var list = lists[listKey]
                        var uniqueKeys = {}
                        list.map(function(listItem) {
                           uniqueKeys[listItem.value+':'+listItem.synonym] = listItem
                           return null
                        })
                        lists[listKey] = Object.values(uniqueKeys).sort(sortListSplits)
                        return null
                    })
                    
                // array of text
                } else {
                    var newSplits=[]
                    for (var q in json) {
                        var textInner = json[q].trim().replace(/[^0-9a-z]/gi, '')
                        if (textInner && textInner.length > 0) {
                            const [synonym, value] = extractSynonym(textInner)
                            newSplits.push({'id':generateObjectId(), 'value':value,'synonym':synonym, 'list':listName})
                        }
                    }
                    lists[key] = newSplits.sort(sortListSplits)
                }
                //console.log(['LISTS',lists])
                return lists
                //return items.sort(sortListSplits) 
            // PLAIN TEXT LIST
            }  else {
                lists = {}
                lists[key] = generateSplits() 
                return lists
            }
        } catch (e) {
            console.log(e)
            // TODO try for yaml
            //try {
              //const doc = yaml.safeLoad(text);
              //console.log(doc);
            //} catch (e) {
               // finally text
                lists = {}
                lists[key] = generateSplits() 
                return lists
            //}
           
        }  
}

        


function parseImportText(text) {
        var items = []
        
        try {
            var json = JSON.parse(text)
            // RASA JSON FORMAT
            if (json && json.rasa_nlu_data && json.rasa_nlu_data.common_examples) {
                for (var i in json.rasa_nlu_data.common_examples) {
                    var entity = json.rasa_nlu_data.common_examples[i]
                    var cleanEntities = entity.entities && entity.entities.map(function(el,j) { return {type:el.entity, value:el.value, start:el.start, end:el.end} })
                    if (entity.text && entity.text.trim().length > 0) {
                        items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, tags:[]})
                    }
                }
                return items.sort(sortExampleSplits)
            // JOVO JSON { "invocation": "my test app", "intents": [{"name": "HelloWorldIntent","phrases": ["hello","say hello"]}] } ,
            } else if (json && json.invocation && json.intents) {
                for (var l in json.intents) {
                    if (json.intents[l] && json.intents[l].phrases) {
                        for (var k in json.intents[l].phrases) {
                            if (json.intents[l].phrases[k] && json.intents[l].phrases[k].trim().length > 0)  {
                                 var phrase = json.intents[l].phrases[k]
                                 var entities = []
                                if (json.intents[l].inputs) {
                                    for (var inputKey in json.intents[l].inputs) {
                                       var input = json.intents[l].inputs[inputKey]
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
                                items.push({'id':generateObjectId(), 'example':phrase.trim(),'intent':json.intents[l].name,"entities": entities, tags: []})
                            }
                        }
                    }
                    //console.log(['JOVO IMPORT',items])
                    //var entity = json.rasa_nlu_data.common_examples[i]
                    //var cleanEntities = entity.entities && entity.entities.map(function(el,j) { return {type:el.entity, value:el.value, start:el.start, end:el.end} })
                    //if (entity.text && entity.text.trim().length > 0) items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, tags:[]})
                }
                return items.sort(sortExampleSplits) //[items, intents, entities, tags]
            // VANILLA JSON [{example:'',intent:'',entities:[{value:'',start:33,end:45}], tags:['dd']}]
            } else if (json && json.length > 0 && json[0].example && json[0].example.trim().length > 0) {
                for (var j in json) {
                    var item = json[j]
                    if (item) {
                        if (item.example && item.example.trim().length > 0) items.push({'id':generateObjectId(), 'example':item.example,'intent':item.intent,"entities":item.entities && item.entities.length > 0 && item.entities[0].value ? item.entities : [], tags:item.tags ? item.tags : []})
                    }
                }
                return items.sort(sortExampleSplits) 
            // PLAIN TEXT LIST
            }  else {
                return generateSplits()
            }
        } catch (e) {
            console.log(e)
            // TODO try for yaml
            //try {
              //const doc = yaml.safeLoad(text);
              //console.log(doc);
            //} catch (e) {
               // finally text
            return generateSplits()
            //}
           
        }   
    }
    
export {parseImportText, parseLists, detectFileType}    
    
