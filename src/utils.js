// FUNCTIONS 

function generateObjectId() {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}
   
function parentUrl(url) {
    return url.split("/").slice(0,-1).join("/") 
}

function concatText(text,words) {
   let parts = text.split(' ')
   let shorter = parts.slice(0,20).join(' ')
   return (shorter.length < text.length) ? shorter + '...' : shorter;
}

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

function parseImportText(text) {
        var items = []
        function generateSplits() {
            const splits = splitSentences(text)
            var newSplits=[]
            splits.map(function(text,i) {
                if (text && text.trim().length > 0) {
                 newSplits.push({'id':generateObjectId(), 'example':text,'intent':'',"entities":[], "tags":[]})
                }
                return null
            })
            return newSplits;
        }
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
                return items 
            // JOVO JSON { "invocation": "my test app", "intents": [{"name": "HelloWorldIntent","phrases": ["hello","say hello"]}] } ,
            } else if (json && json.invocation && json.intents) {
                for (var l in json.intents) {
                    if (json.intents[l] && json.intents[l].phrases) {
                        for (var k in json.intents[l].phrases) {
                            if (json.intents[l].phrases[k] && json.intents[l].phrases[k].trim().length > 0)  {
                                 var phrase = json.intents[l].phrases[k]
                                 var entities = []
                                if (json.intents[l].inputs) {
                                    json.intents[l].inputs.map(function(input,inputKey) {
                                      
                                       console.log([phrase,input.name])
                                       const markerStart = phrase.indexOf("{"+input.name+"}")
                                       if (markerStart !== -1)  {
                                           phrase = phrase.replace("{"+input.name+"}",input.name)
                                       }
                                       var entity = {type:input.name, value:input.name , start: markerStart , end: markerStart + input.name.length  }
                                       entities.push(entity)
                                    })
                                }
                                items.push({'id':generateObjectId(), 'example':phrase.trim(),'intent':json.intents[l].name,"entities": entities, tags: []})
                            }
                        }
                    }
                    console.log(['JOVO IMPORT',items])
                    //var entity = json.rasa_nlu_data.common_examples[i]
                    //var cleanEntities = entity.entities && entity.entities.map(function(el,j) { return {type:el.entity, value:el.value, start:el.start, end:el.end} })
                    //if (entity.text && entity.text.trim().length > 0) items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, tags:[]})
                }
                return items //[items, intents, entities, tags]
            // VANILLA JSON [{example:'',intent:'',entities:[{value:'',start:33,end:45}], tags:['dd']}]
            } else if (json && json.length > 0 && json[0].example && json[0].example.trim().length > 0) {
                for (var j in json) {
                    var item = json[j]
                    if (item) {
                        if (item.example && item.example.trim().length > 0) items.push({'id':generateObjectId(), 'example':item.example,'intent':item.intent,"entities":item.entities && item.entities.length > 0 && item.entities[0].value ? item.entities : [], tags:item.tags ? item.tags : []})
                    }
                }
                return items 
            // PLAIN TEXT LIST
            }  else {
                return generateSplits()
            }
        } catch (e) {
            console.log(e)
            // TODO try for markdown

            // finally text
            return generateSplits()
        }   
    }
    
export {generateObjectId, parentUrl, concatText, parseImportText }
