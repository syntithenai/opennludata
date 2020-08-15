import { generateObjectId, uniquifyArray, replaceEntities } from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'

async function exportJOVO(skill) {
     return new Promise(function(resolve,reject) {
         var listsStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "lists",
         });
         listsStorage.getItem('alldata').then(function(lists) {
             var jovo={invocation: skill.invocation}
             //console.log(['JVO export',skill])
             var intents = {}
             var entityTypes={}
             if (skill.intents) {
                 Object.keys(skill.intents).map(function(intentKey) {
                     var examples = skill.intents[intentKey]
                     if (!intents[intentKey])  intents[intentKey] = {name:intentKey, phrases:[], inputs: []}
                     var inputs = {}
                     if (Array.isArray(examples)) {
                         examples.map(function(example) {
                            intents[intentKey].phrases.push(replaceEntities(example.example,example.entities))
                            if (Array.isArray(example.entities)) {
                                example.entities.map(function(entity) {
                                   inputs[entity.type] = true  
                                   if (!Array.isArray(entityTypes[entity.type])) entityTypes[entity.type] = []
                                   entityTypes[entity.type].push(entity.value)
                                })
                            }
                         })
                     }
                     intents[intentKey].phrases = uniquifyArray(intents[intentKey].phrases).sort()
                     intents[intentKey].inputs = Object.keys(inputs).map(function(entityType) { 
                         var entityTypeName = entityType+"Type"
                         if (skill.entities && skill.entities[entityType] && (skill.entities[entityType].googleType || skill.entities[entityType].alexaType)) {
                             entityTypeName ={}
                             if (skill.entities[entityType].googleType) entityTypeName.dialogflow = skill.entities[entityType].googleType
                             if (skill.entities[entityType].alexaType) entityTypeName.alexa = skill.entities[entityType].alexaType
                         } 
                         return {name: entityType, type: entityTypeName} 
                    })
                 }) 
             }
             jovo.intents = Object.values(intents)
             //console.log(['skill lists',entityTypes, skill.lists])
             //var usedLists = {}
             //if (skill.entities) {
                //Object.keys(skill.entities).map(function(entity,i) {
                    //if (skill.entities[entity] && Array.isArray(skill.entities[entity].lists)) {
                        //skill.entities[entity].lists.map(function(list) {
                           //usedLists[list] = true  
                        //})
                    //}
                //})
             //}
            
             //lists.map(function(item) {
                 //console.log(['LIST',item])
                 //Object.keys(usedLists).map(function(listKey) {
                    //console.log([listKey,item.tags.indexOf(listKey) !== -1, item.tags])
                    //if (item && item.tags && item.tags.indexOf(listKey) !== -1) {
                        //console.log('list item used ')
                        //entityTypes[listKey].push(item.value)
                    //}
                //})
            //})
            var synonyms = {}
            var synonymsIndex = {}
            lists.map(function(item) {
                 if (item.value && item.value.trim().length > 0) {
                    if (item.synonym) {
                        if (!Array.isArray(synonymsIndex[item.synonym])) synonymsIndex[item.synonym] = [] 
                        synonyms[item.value] = item.synonym
                        synonymsIndex[item.synonym].push(item.value)
                    }
                    Object.keys(entityTypes).map(function(entityType) {
                        if (skill.entities && skill.entities[entityType]  && skill.entities[entityType].lists)  {
                            skill.entities[entityType].lists.map(function(entityExtrasList) {
                                //console.log(['li',entityExtrasList,item.tags,item.tags.indexOf(entityExtrasList)])
                                if (item && item.tags && item.tags.indexOf(entityExtrasList) !== -1) {
                                    //console.log(['USE ENTITY',entityType, entityExtrasList,lists[entityExtrasList]])
                                    entityTypes[entityType].push(item.value)
                               }
                            })
                        }
                    })
                }
            })
             
            console.log(['synonyms',synonyms, synonymsIndex])
        
            jovo.inputTypes = Object.keys(entityTypes).map(function(entityType) {
            //console.log(['JOVOEX',lists,entityType])
                const values = []
                uniquifyArray(entityTypes[entityType]).sort().map(function(value) {
                    if (!synonyms[value]) {
                        if (value && value.trim().length > 0) values.push( {value:value})
                    }
                    return null
                })
                Object.keys(synonymsIndex).map(function(synonym) {
                    if (synonym && synonym.trim().length > 0) values.push({value:synonym, synonyms:synonymsIndex[synonym] })
                    return null
                })
                return {name: entityType+"Type", values:values}  
            })
                    
            
            
            console.log(['inputtypes',jovo.inputTypes])
            //console.log(['JVO final',jovo])
            const content = JSON.stringify(jovo)
             const final =  {folders:[{'name':'models', files:[{name:'en-US.json', content: content}] }]   }
             //console.log(['JVO final',final])
             resolve(final)
              
        })
    })
}


async function exportJOVOZip(skill) {
    return createZip(await exportJOVO(skill))
}

export {exportJOVO, exportJOVOZip}
