import { generateObjectId } from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'

function exportJSON(skill) {
    console.log(['EXPPORT JSON',skill])
    return new Promise(function(resolve,reject) {
         var listsStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "lists",
         });
         var utterancesStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "utterances",
         });
         listsStorage.getItem('alldata').then(function(lists) {
             console.log(['LISTS',lists])
            var usedLists = {}
            if (skill.entities) {
                Object.keys(skill.entities).map(function(entity,i) {
                    if (skill.entities[entity] && Array.isArray(skill.entities[entity].lists)) {
                        skill.entities[entity].lists.map(function(list) {
                           usedLists[list] = true  
                        })
                    }
                })
            }
            var skillLists = {}
            Object.keys(usedLists).map(function(listKey) {
              skillLists[listKey] = []  
            })
            lists.map(function(item) {
                Object.keys(usedLists).map(function(listKey) {
                    //console.log([listKey,item.tags.indexOf(listKey) !== -1, item.tags])
                    if (item && item.tags && item.tags.indexOf(listKey) !== -1) {
                        //console.log('list item used ')
                        skillLists[listKey].push(item.value)
                    }
                })
            })
            skill.lists = skillLists
            
            var utterances = {}
            
            console.log(['SHOULD ADD UTTS',skill.utterancesLists, skill.utterances])
            if (skill.utterancesLists || skill.utterances) { 
                utterancesStorage.getItem('alldata').then(function(allUtterances) {
                    if (Array.isArray(allUtterances)) {
                        allUtterances.map(function(thisUtterance) {
                            if (skill.utterances) { 
                                skill.utterances.map(function(listKey) {
                                    if (thisUtterance.value === listKey) utterances[thisUtterance.value] = thisUtterance  
                                })
                                
                            }
                            if (skill.utterancesLists) { 
                                skill.utterancesLists.map(function(listKey) {
                                    if (thisUtterance.tags && thisUtterance.tags.indexOf(listKey) !== -1) utterances[thisUtterance.value] = thisUtterance  
                                })
                                
                            }
                             
                        })
                         console.log(['SET UITTER GLOLBA',utterances])
                         skill.utteranceLookups = utterances
                         resolve(skill)
                    } else {
                         resolve(skill)
                    }
                })
               
                
            } else {
                 resolve(skill)
            }
            console.log(['resolve JSON',skill])
           
        })
        
    })
}

function exportJSONZip(skill) {
    return new Promise(function(resolve,reject) {
        exportJSON(skill).then(function(content) {
            console.log(['content',skill])
            const blob = new Blob([JSON.stringify(content, null, 2)], {type : 'application/json'});
            resolve(blob)
        })
    })
    //return createZip({files:[{name:'skill.json', content: await exportJSON(skill)}]})
}

export {exportJSON, exportJSONZip}
