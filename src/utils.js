//const yaml = require('js-yaml');
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


    
    function findFirstDiffPos(a, b) {
      if (a === b) return -1;
      for (var i=0; a[i] === b[i]; i++) {}
      return i;
    }
    
    function uniquifyArray(a) {
        console.log(['UNIQARRAY',a])
        if (Array.isArray(a)) {
            var index = {}
            a.map(function(value) {
                index[value] = true 
            })
            return Object.keys(index)
        } else {
            return []
        }
    }

    function uniquifyArrayOfObjects(a,field) {
         if (Array.isArray(a)) {
             var index = {}
            var emptyIndex = null
            a.map(function(value) {
                if (value) {
                    if (value[field]) {
                        index[value[field]] = value 
                    } else {
                        emptyIndex = value
                    }
                }
            })
            if (emptyIndex) return [emptyIndex].concat(Object.values(index))
            else return Object.values(index)
        } else {
            return []
        }
    }
    
export {generateObjectId, parentUrl, concatText , findFirstDiffPos, splitSentences,uniquifyArray, uniquifyArrayOfObjects}
