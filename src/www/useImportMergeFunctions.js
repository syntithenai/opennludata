import localforage from 'localforage'
import {uniquifyArray, generateObjectId} from './utils'
import scrabbleWords from './scrabbleWords'

export default function useImportMergeFunctions() {
    
     var localforageStorageIntents = localforage.createInstance({
       name: 'nlutool',
       storeName   :'examples',
     });
     var localforageStorageEntities = localforage.createInstance({
       name: 'nlutool',
       storeName   :'lists',
     });
     var localforageStorageUtterances = localforage.createInstance({
       name: 'nlutool',
       storeName   :'utterances',
     });
     var localforageStorageRegexps = localforage.createInstance({
       name: 'nlutool',
       storeName   :'regexps',
     });
     var localforageStorageForm = localforage.createInstance({
       name: 'nlutool',
       storeName   :'forms',
     }); 
     var localforageStorageAction = localforage.createInstance({
       name: 'nlutool',
       storeName   :'actions',
     });
     var localforageStorageApi = localforage.createInstance({
       name: 'nlutool',
       storeName   :'apis',
     });
     var localforageStorageSkill = localforage.createInstance({
       name: 'nlutool',
       storeName   :'skills',
     });
    /**
     *  merge an array of json structured intents into the main intent database 
     * 
     *  every import records is tagged with the skill parameter when present
     */
    function mergeIntents(examples,skill) {
        return new Promise(function(resolve, reject) {
            console.log(['import examples',examples, typeof examples,skill])
            if (examples) {
                localforageStorageIntents.getItem('alldata').then(function(allItems) {
                    var allItemsIndex = {}
                    if (!allItems) {
                        allItems = []
                    }
                    // index existing items by example
                    
                    allItems.map(function(listItem) {
                        const key = JSON.stringify({entities:listItem.entities ? listItem.entities : [], intent: listItem.intent ? listItem.intent : '', example: listItem.example ? listItem.example : ''})
                        if (listItem && listItem.example && listItem.example.trim())  {
                            allItemsIndex[key] = listItem
                        }
                        return null
                    })
                    var newItems=[]
                    var replacements=[]
                    
                    examples.map(function(listItem) {
                        if (listItem && listItem.example && listItem.example.trim())  {
                            const key = JSON.stringify({entities:listItem.entities ? listItem.entities : [], intent: listItem.intent ? listItem.intent : '', example: listItem.example ? listItem.example : ''})
                            listItem.id = listItem.id ? listItem.id : generateObjectId()
                            // intent example already exists
                            if (allItemsIndex[key]) {
                                replacements.push(listItem)
                            } else {
                                newItems.push(listItem)
                                if (skill) listItem.skills = listItem.skills ? uniquifyArray( listItem.skills.push(skill)) : [skill]
                            }
                            //allItemsIndex[listItem.value] = listItem
                        } 
                        return null
                    })
                    var final = []
                    if (replacements.length > 0) {
                        replacements.map(function(listItem) {
                            const key = JSON.stringify({entities:listItem.entities ? listItem.entities : [], intent: listItem.intent ? listItem.intent : '', example: listItem.example ? listItem.example : ''})
                            if (skill) listItem.skills = listItem.skills ? uniquifyArray( listItem.skills.push(skill)) : [skill]
                            allItemsIndex[key] = listItem
                            return null
                        }); 
                        final = [].concat(newItems,Object.values(allItemsIndex))
                    } else {
                        final = [].concat(newItems,allItems)
                    }
                    console.log('IMPORT MERGE intents',final)
                    localforageStorageIntents.setItem('alldata',final).then(function() {
                      resolve({updated:replacements.length, created: newItems.length})  
                    })
                    //props.history.push('/import') 
                
                })
              } else {
                reject({error:"Missing import data"})
            }
        })
    }
    
    
     function updateIntents(examples) {
        return new Promise(function(resolve, reject) {
            console.log(['update examples',examples, typeof examples])
            if (examples) {
                localforageStorageIntents.getItem('alldata').then(function(allItems) {
                    // index incoming examples by id
                    var examplesHash = {}
                    examples.map(function(listItem) {
                        if (listItem && listItem.example && listItem.example.trim() && listItem.id )  {
                            examplesHash[listItem.id] = listItem
                           
                        } 
                        return null
                    })
                    // iterate all items returning replacement or existing
                    var newItems = allItems.map(function(listItem) {
                        const key = listItem.id //JSON.stringify({entities:listItem.entities ? listItem.entities : [], intent: listItem.intent ? listItem.intent : '', example: listItem.example ? listItem.example : ''})
                        if (listItem && listItem.example && listItem.example.trim() && listItem.id && examplesHash[listItem.id])  {
                            return examplesHash[listItem.id]
                        } else {
                            return listItem
                        }
                    })
                   
                    console.log('IMPORT updated intents',newItems)
                    localforageStorageIntents.setItem('alldata',newItems).then(function(err,data) {
                        console.log(["DONE SAVE IMPORT intents",err,data])
                        //throw new Error('eee')
                        resolve()  
                    })
                    //props.history.push('/import') 
                
                })
              } else {
                reject({error:"Missing import data"})
            }
        })
    }


    function mergeEntities(entities, list) {
        //console.log(['merge entities',entities, list])
        return new Promise(function(resolve, reject) {
            if (entities) {
                var sWords = scrabbleWords()
                localforageStorageEntities.getItem('alldata').then(function(allLists) {
                    ////console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    var created = 0
                    var updated = 0;
                    entities.map(function(listItem,listItemIndex) {
                        var newListItem = listItem;
                        newListItem.id = newListItem.id ? newListItem.id : generateObjectId()
                        // already there, just update tags
                        if (allListsIndex[listItem.value]) {
                            updated += 1
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            if (list && list.trim().length > 0) newListItem.tags.push(list.trim())
                            if (sWords.indexOf(listItem.value.toUpperCase()) !== -1) {
                                newListItem.tags.push('scrabbleword')
                            }
                            // merge alternatives
                            var existingAlternatives = allListsIndex[listItem.value].synonym ? allListsIndex[listItem.value].synonym.split("\n") : []
                            var newAlternatives = newListItem.synonym ? newListItem.synonym.split("\n") : []
                            newListItem.synonym = uniquifyArray([].concat(existingAlternatives, newAlternatives)).sort().join("\n")
                          
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        // new list item    
                        } else {
                            created += 1
                            newListItem = {id: generateObjectId() , value: newListItem.value, synonym: newListItem.synonym ? newListItem.synonym : '', tags:newListItem.tags ? newListItem.tags : []}
                            if (list && list.trim().length > 0) newListItem.tags.push(list.trim())
                            if (sWords.indexOf(listItem.value.toUpperCase()) !== -1) {
                                newListItem.tags.push('scrabbleword')
                            }
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        }
                        return null
                    })
                    
                    ////console.log('IMPORT MERGE',res,parsed,[].concat(parsed,res))
                    localforageStorageEntities.setItem('alldata',Object.values(allListsIndex)).then(function() {
                        resolve({updated:updated, created: created})  
                    })
                    //props.history.push('/lists') 
                    ////props.setPageMessage(<div><b>sdfsdf</b><br/><b>sdfsdf</b><br/><b>sdfsdf</b><br/><b>sdfsdf</b><br/></div>)
                    //props.setPageMessage('Imported '+Object.keys(allListsIndex).length +' entities into the list '+ title)
                    //setTimeout(function() {
                        //props.setPageMessage('')
                    //},2000)
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    
    function mergeUtterances(utterances,addTag) {
        console.log(['merge utterances',utterances, addTag])
        return new Promise(function(resolve, reject) {
            if (utterances) {
                localforageStorageUtterances.getItem('alldata').then(function(allLists) {
                    ////console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    var created = 0
                    var updated = 0;
                    utterances.map(function(listItem,listItemIndex) {
                        var newListItem = listItem;
                        newListItem.id = newListItem.id ? newListItem.id : generateObjectId()
                        // already there, just append tag and alternatives
                        if (allListsIndex[listItem.value]) {
                            updated += 1
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            // merge alternatives
                            //var existingAlternatives = allListsIndex[listItem.value].synonym ? allListsIndex[listItem.value].synonym.split("\n") : []
                            //var newAlternatives = newListItem.synonym ? newListItem.synonym.split("\n") : []
                            //newListItem.synonym = uniquifyArray([].concat(existingAlternatives, newAlternatives)).sort().join("\n")
                            // add tag ?
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        // new list item    
                        } else {
                            created += 1
                            newListItem.id = generateObjectId()
                             //= {id: generateObjectId() , value: newListItem.value, synonym: newListItem.synonym ? newListItem.synonym : '', tags:[]}
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        }
                        return null
                    })
                    
                    console.log(['IMPORT MERGE responses DONE',allListsIndex])
                    localforageStorageUtterances.setItem('alldata',Object.values(allListsIndex)).then(function() {
                        resolve({updated:updated, created: created})  
                    })
                    //props.history.push('/lists') 
                    ////props.setPageMessage(<div><b>sdfsdf</b><br/><b>sdfsdf</b><br/><b>sdfsdf</b><br/><b>sdfsdf</b><br/></div>)
                    //props.setPageMessage('Imported '+Object.keys(allListsIndex).length +' entities into the list '+ title)
                    //setTimeout(function() {
                        //props.setPageMessage('')
                    //},2000)
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    
    
    function mergeRegexps(regexps,addTag) {
        console.log(['merge regexps',regexps, addTag])
        return new Promise(function(resolve, reject) {
            if (regexps) {
                localforageStorageRegexps.getItem('alldata').then(function(allLists) {
                    ////console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    var created = 0
                    var updated = 0;
                    regexps.map(function(listItem,listItemIndex) {
                        var newListItem = listItem;
                        newListItem.id = newListItem.id ? newListItem.id : generateObjectId()
                        // already there, just append tag and alternatives
                        if (allListsIndex[listItem.value]) {
                            updated += 1
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        // new list item    
                        } else {
                            created += 1
                            newListItem = {id: generateObjectId() , value: newListItem.value, synonym: newListItem.synonym ? newListItem.synonym : '', tags:[]}
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        }
                        return null
                    })
                    
                    console.log('IMPORT MERGE reg',allListsIndex)
                    localforageStorageRegexps.setItem('alldata',Object.values(allListsIndex)).then(function() {
                        resolve({updated:updated, created: created})  
                    })
              
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    
    // froim here
    
    function mergeForms(forms,addTag) {
        console.log(['merge forms',forms, addTag])
        return new Promise(function(resolve, reject) {
            if (forms) {
                localforageStorageForm.getItem('alldata').then(function(allLists) {
                    ////console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    var created = 0
                    var updated = 0;
                    forms.map(function(listItem,listItemIndex) {
                        var newListItem = listItem;
                        newListItem.id = newListItem.id ? newListItem.id : generateObjectId()
                        // already there, append tag and alternatives
                        if (listItem && listItem.value && allListsIndex[listItem.value]) {
                            updated += 1
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            // add tag ?
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        // new list item    
                        } else if (newListItem && newListItem.value) {
                            created += 1
                            newListItem.id= generateObjectId() 
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        }
                        return null
                    })
                    console.log('IMPORT MERGE form',allListsIndex)
                    localforageStorageForm.setItem('alldata',Object.values(allListsIndex)).then(function() {
                        resolve({updated:updated, created: created})  
                    })
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    
    
    function mergeActions(actions,addTag) {
        console.log(['merge actions',actions, addTag])
        return new Promise(function(resolve, reject) {
            if (actions) {
                localforageStorageAction.getItem('alldata').then(function(allLists) {
                    ////console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    var created = 0
                    var updated = 0;
                    actions.map(function(listItem,listItemIndex) {
                        var newListItem = listItem;
                        newListItem.id = newListItem.id ? newListItem.id : generateObjectId()
                        // already there, append tag and alternatives
                        if (listItem && listItem.value && allListsIndex[listItem.value]) {
                            updated += 1
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            // add tag ?
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        // new list item    
                        } else if (newListItem && newListItem.value) {
                            created += 1
                            newListItem.id= generateObjectId() 
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        }
                        return null
                    })
                    console.log('IMPORT MERGEd act',allListsIndex)
                    localforageStorageAction.setItem('alldata',Object.values(allListsIndex)).then(function() {
                        resolve({updated:updated, created: created})  
                    })
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    
    
    function mergeApis(apis,addTag) {
        console.log(['merge apis',apis, addTag])
        return new Promise(function(resolve, reject) {
            if (apis) {
                localforageStorageApi.getItem('alldata').then(function(allLists) {
                    ////console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    var created = 0
                    var updated = 0;
                    apis.map(function(listItem,listItemIndex) {
                        var newListItem = listItem;
                        newListItem.id = newListItem.id ? newListItem.id : generateObjectId()
                        // already there, just append tag and alternatives
                        if (allListsIndex[listItem.value]) {
                            updated += 1
                            newListItem.tags = newListItem.tags ? newListItem.tags : []
                            // add tag ?
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        // new list item    
                        } else {
                            created += 1
                            newListItem = {id: generateObjectId() , value: newListItem.value, synonym: newListItem.synonym ? newListItem.synonym : '', tags:[]}
                            if (addTag && addTag.trim().length > 0) newListItem.tags.push(addTag.trim())
                            // uniquify and sort tags
                            newListItem.tags = uniquifyArray(newListItem.tags).sort()
                            allListsIndex[newListItem.value] = newListItem
                        }
                        return null
                    })
                    
                    console.log('IMPORT MERGEd apis',allListsIndex)
                    localforageStorageApi.setItem('alldata',Object.values(allListsIndex)).then(function() {
                        resolve({updated:updated, created: created})  
                    })
              
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    
    
    
    
    
    
    function mergeSkill(skill) {
        //console.log(['merge skill',skill])
        return new Promise(function(resolve, reject) {
            if (skill && skill.title) {
                localforageStorageSkill.getItem(skill.title).then(function(found) {
                    // merge ?
                    if (found) {
                        //console.log(['found skill',skill])
                        localforageStorageSkill.setItem(skill.title,skill).then(function() {
                            resolve({})  
                        })
                    } else {
                        //console.log(['create skill',skill])
                        localforageStorageSkill.setItem(skill.title,skill).then(function() {
                            resolve({})  
                        })
                    }
                })
            } else {
                reject({error:"Failed import"})
            }
        })
    }
    

    return  {mergeIntents, mergeEntities, mergeUtterances, mergeRegexps, mergeForms, mergeActions, mergeApis,  mergeSkill, updateIntents}

}
