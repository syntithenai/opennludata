var balanced = require('balanced-match');

var t = "(i|we) want to (see ({tigers}|{(lions|lions and their cubs)})|watch {(penguins|monkeys)}) AT the {zoo}"
console.log(generateIntentSplitsForMycroft(t, 'dostuff'))

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
