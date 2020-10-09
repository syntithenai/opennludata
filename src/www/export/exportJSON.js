import localforage from 'localforage'


/* export skill
 * to ensure the completeness of the skill model add
 *   - utterancesData
 *   - entitiesData
 * which are both arrays of objects containing value and synonym(alternatives) eg {value:"cat", synonym:"kitty\npussy"}
 */
function exportJSON(skill) {
    //console.log(['EXPPORT JSON',skill])
    var listsStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "lists",
    });
    var utterancesStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "utterances",
    });
    var promises = []    
    // entities - just entities in entity lists
    promises.push(new Promise(function(resolve,reject) {
        if (skill && skill.entities) {
             listsStorage.getItem('alldata').then(function(dbEntities) {
                 var usedLists = {}
                 var filledLists = {}
                 //console.log(skill.entities)
                 if (skill && skill.entities) {
                     Object.values(skill.entities).map(function(entity) {
                        if (entity.lists) entity.lists.map(function(list) {
                            usedLists[list] = true  
                        })  
                        return null
                     })
                     //console.log(['USEDLISTS',usedLists])
                     Object.keys(usedLists).map(function(useList) {
                         filledLists[useList] = dbEntities.filter(function(item) {if (item.tags && item.tags.indexOf(useList) !== -1) return true; else return false }).map(function(iitem) {
                             return {value:iitem.value, synonym: iitem.synonym}  
                         })
                     })
                     //console.log(['FILLEDLISTS',filledLists])
                    //console.log(['SETSKILL',JSON.parse(JSON.stringify(skill))])
                 }
                 resolve(filledLists)
             })
        } else {
            resolve({})
        }
    }))
    promises.push(new Promise(function(resolve,reject) {
        var utterances = {}
        //console.log(['SHOULD ADD UTTS',skill.utterancesLists, skill.utterances])
        if (skill.utterancesLists || skill.utterances) { 
            utterancesStorage.getItem('alldata').then(function(allUtterances) {
                if (Array.isArray(allUtterances)) {
                    allUtterances.map(function(thisUtterance) {
                        if (skill.utterances) { 
                            skill.utterances.map(function(listKey) {
                                if (thisUtterance.value === listKey) utterances[thisUtterance.value] = {value:thisUtterance.value, synonym:thisUtterance.synonym, tags: thisUtterance.tags}
                                return null
                            })
                            
                        }
                        if (skill.utterancesLists) { 
                            skill.utterancesLists.map(function(listKey) {
                                if (thisUtterance.tags && thisUtterance.tags.indexOf(listKey) !== -1) utterances[thisUtterance.value] = {value:thisUtterance.value, synonym:thisUtterance.synonym, tags: thisUtterance.tags}
                                return null
                            })
                            
                        }
                        return null 
                    })
                    //console.log(['SET UITTER GLOLBA',utterances])
                    
                }
                resolve(utterances)
            })
       } else {
           resolve({})
       }
    }))
            
    return new Promise(function(oresolve,oreject) {
       //skill.entitiesData = filledLists
        //skill.utterancesData = utterances                   
        Promise.all(promises).then(function(data) {
            //console.log(['LOIADED LOOKUPS',data])
            var newSkill = skill
            newSkill.entitiesData = data[0]
            newSkill.utterancesData = data[1]
            //console.log(['resolve JSON',newSkill])
            oresolve(newSkill)
        })
        
    })
}

function exportJSONZip(skill) {
    return new Promise(function(resolve,reject) {
        exportJSON(skill).then(function(content) {
            //console.log(['content',skill])
            const blob = new Blob([JSON.stringify(content, null, 2)], {type : 'application/json'});
            resolve(blob)
        })
    })
    //return createZip({files:[{name:'skill.json', content: await exportJSON(skill)}]})
}

export {exportJSON, exportJSONZip}


          
 //listsStorage.getItem('alldata').then(function(lists) {
             ////console.log(['LISTS',lists])
            //var usedLists = {}
            //if (skill.entities) {
                //Object.keys(skill.entities).map(function(entity,i) {
                    //if (skill.entities[entity] && Array.isArray(skill.entities[entity].lists)) {
                        //skill.entities[entity].lists.map(function(list) {
                           //usedLists[list] = true  
                           //return null
                        //})
                    //}
                    //return null
                //})
            //}
            //var skillLists = {}
            //Object.keys(usedLists).map(function(listKey) {
              //skillLists[listKey] = []  
              //return null
            //})
            //if (lists) lists.map(function(item) {
                //Object.keys(usedLists).map(function(listKey) {
                    //////console.log([listKey,item.tags.indexOf(listKey) !== -1, item.tags])
                    //if (item && item.tags && item.tags.indexOf(listKey) !== -1) {
                        //////console.log('list item used ')
                        //skillLists[listKey].push(item.value)
                    //}
                    //return null
                //})
                //return null
            //})
            //skill.lists = skillLists
            
                //// utterances
                //if (props.currentSkill && props.currentSkill.utterances) {
                     //utterancesStorage.getItem('alldata').then(function(dbUtterances) {
                         //var usedLists = {}
                         //var filledLists = {}
                         ////console.log(props.currentSkill.utterances)
                         //if (props.currentSkill && props.currentSkill.utterancesLists) {
                             //Object.values(props.currentSkill.utterancesLists).map(function(utterance) {
                                //usedLists[utterance] = true  
                                //return null
                             //})
                             ////console.log(['USEDLISTS',usedLists])
                             //Object.keys(usedLists).map(function(useList) {
                                 //filledLists[useList] = dbUtterances.filter(function(item) {if (item.tags && item.tags.indexOf(useList) !== -1) return true; else return false }).map(function(iitem) {
                                     //return {value:iitem.value, synonym: iitem.synonym}  
                                 //})
                             //})
                             ////console.log(['FILLEDLISTS',filledLists])
                              //var skill = props.currentSkill
                              //skill.utterancesData = filledLists
                              //resolve(skill)
                         //}
                     //})
                    
                //}
