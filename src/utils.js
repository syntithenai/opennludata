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
        try {
            var json = JSON.parse(text)
            var items = []
            var intents = []
            var entities = []
            var tags = []
            
            if (json && json.rasa_nlu_data && json.rasa_nlu_data.common_examples) {
                for (var i in json.rasa_nlu_data.common_examples) {
                    var entity = json.rasa_nlu_data.common_examples[i]
                    var cleanEntities = entity.entities && entity.entities.map(function(el,j) { return {type:el.entity, value:el.value, start:el.start, end:el.end} })
                    
                    items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, tags:[]})
                    //intents.push(entity.intent)
                    //entities.push(cleanEntities)
                    //tags.push([])
                }
                //console.log(['prep import json',[items, intents, entities, tags]])
                return items //[items, intents, entities, tags]
            } else {
                const splits = splitSentences(text)
                return splits.map(function(text,i) {
                     items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, "tags":new Array(splits.length)})
                })
                //.map(function(split) {return {'example':split, 'intent':'', 'entities':[], 'tags':[]}})
                //console.log(['prep import text',splits])
                //return [splits, new Array(splits.length), new Array(splits.length), new Array(splits.length)]
            }
        } catch (e) {
            console.log(e)
            // TODO try for markdown

            // finally text
            const splits = splitSentences(text)
            return splits.map(function(text,i) {
                 items.push({'id':generateObjectId(), 'example':entity.text,'intent':entity.intent,"entities":cleanEntities, "tags":new Array(splits.length)})
            })
                //.map(function(split) {return {'example':split, 'intent':'', 'entities':[], 'tags':[]}})
            //return [splits, new Array(splits.length), new Array(splits.length), new Array(splits.length)]
        }   
    }
    
export {generateObjectId, parentUrl, concatText, parseImportText }
