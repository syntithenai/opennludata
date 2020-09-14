import {  uniquifyArray, replaceEntities } from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'

async function exportMycroft(skill) {
    return new Promise(function(resolve,reject) {
        var listsStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "lists",
         });
         var modelFiles=[]
         listsStorage.getItem('alldata').then(function(lists) {
            //var usedLists = {}
            //if (skill.entities) {
                //Object.keys(skill.entities).map(function(entity,i) {
                    //if (skill.entities[entity] && Array.isArray(skill.entities[entity].lists)) {
                        //skill.entities[entity].lists.map(function(list) {
                           //usedLists[list] = true  
                        //})
                    //}
                    //return null
                //})
            //}
           
            
            
           
             // intents - 
             // collate examples, one file per intent
             var intents={}
             if (skill.intents) {
                 Object.keys(skill.intents).map(function(intentKey) {
                     var examples = skill.intents[intentKey]
                     if (!Array.isArray(intents[intentKey]))  intents[intentKey] = []
                     if (Array.isArray(examples)) {
                         examples.map(function(example) {
                            intents[intentKey].push(replaceEntities(example.example,example.entities))
                            return null
                         })
                     }
                     intents[intentKey] = uniquifyArray(intents[intentKey]).sort()
                    return null
                 }) 
             }
             // one per file
             // entities - merge values and lists values , one entity per file
             var entities={}
             if (skill.entities) { 
                 Object.keys(skill.entities).map(function(entityKey) {
                     var combinedEntities = []
                     var entity = skill.entities[entityKey]
                     if (entity.values) {
                         combinedEntities = combinedEntities.concat(entity.values)
                     } 
                     if (entity.lists) {
                         //var skillLists = {}
                         //Object.keys(usedLists).map(function(listKey) {
                          //skillLists[listKey] = []  
                          //return null
                        //})
                       
                       //console.log(['add from lists',entity.lists])
                       lists.map(function(item) {
                            entity.lists.map(function(listKey) {
                                //console.log([listKey,item.tags.indexOf(listKey) !== -1, item.tags])
                                if (item && item.tags && item.tags.indexOf(listKey) !== -1) {
                                    //console.log('list item used ')
                                    combinedEntities.push(item.value)
                                }
                                return null
                            })
                            return null
                        })
                     }
                     entities[entityKey] = uniquifyArray(combinedEntities).sort()
                     return null
                 }) 
             }
             
             Object.keys(intents).map(function(intent) {
                 modelFiles.push({name:intent+'.intent',content: intents[intent].join("\n")})
                 return null
             })
             Object.keys(entities).map(function(entity) {
                 modelFiles.push({name: entity+'.entity',content: entities[entity].join("\n")})
                 return null
             })
             if (skill.utterances) {
                  Object.keys(skill.utterances).map(function(utterance) {
                     modelFiles.push({name: utterance.value+'.dialog',content: utterance.synonym})
                     return null
                  })   
             }
             
              resolve( modelFiles)
        })
    })
}


async function exportMycroftZip(skill) {
    const files = await exportMycroft(skill)
    return createZip({files:files})
}

export {exportMycroft, exportMycroftZip}

