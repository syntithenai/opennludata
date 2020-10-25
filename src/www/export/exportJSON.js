import localforage from 'localforage'


/* export skill
 * to ensure the completeness of the skill model add
 *   - utterancesData
 *   - entitiesData
 * which are both arrays of objects containing value and synonym(alternatives) eg {value:"cat", synonym:"kitty\npussy"}
 */
function exportJSON(skill) {
    
    console.log(['EXPPORT JSON',skill, skill ? skill.apis : []])
    var listsStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "lists",
    });
    var utterancesStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "utterances",
    });
    var actionsStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "actions",
    });
    var apisStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "apis",
    });
    var formsStorage = localforage.createInstance({
        name: "nlutool",
        storeName   : "forms",
    });
    
    
    
    
    var promises = []    
    
    var outerPromise = new Promise(function(oresolve,oreject) {
        
        formsStorage.getItem('alldata').then(function(allForms) {
            console.log(['ALLFORMS',allForms])
            
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
            // iterate skill rules and stories steps and actions, collating utterances and actions used 
            var usedUtterances = {}
            var usedActions = {}
            var usedApis = {}
            var usedForms = {}
            if (skill.rules && Array.isArray(skill.rules)) {
                skill.rules.map(function(rule,ruleKey) {
                    if (rule.steps) rule.steps.map(function(step,stepKey) {
                        if (step && step.indexOf('utter ') === 0) {
                            var stepName = step.slice(6)
                            usedUtterances[stepName] = 1
                        } else if (step && step.indexOf('action ') === 0) {
                            var stepName = step.slice(7)
                            usedActions[stepName] = 1 
                        } else if (step && step.indexOf('form ') === 0) {
                            var stepName = step.slice(5)
                            usedForms[stepName] = 1 
                        }  
                    })
                })
            } 
            if (skill.stories && Array.isArray(skill.stories)) {
                skill.stories.map(function(story) {
                    if (story.steps) story.steps.map(function(step,stepKey) {
                        if (step && step.indexOf('utter ') === 0) {
                            var stepName = step.slice(6)
                            usedUtterances[stepName] = 1
                        } else if (step && step.indexOf('action ') === 0) {
                            var stepName = step.slice(7)
                            usedActions[stepName] = 1 
                        } else if (step && step.indexOf('form ') === 0) {
                            var stepName = step.slice(5)
                            usedForms[stepName] = 1 
                        } 
                    })
                })
            } 
            
            // also utterances used in forms
            // first build lookups
           //
            var formLookups = {}
            allForms.map(function(form) {
                if (form && form.value && usedForms[form.value] === 1) {
                    formLookups[form.value] = form
                }
            })
            Object.keys(formLookups).map(function(formName) {
                var form = formLookups[formName]
                if (Array.isArray(form.slots)) form.slots.map(function(slot) {
                   if (slot && slot.text) {
                       usedUtterances[slot.text] = 1
                   } 
                })
            })
            console.log(['utss plsu form',allForms,usedForms,formLookups,usedUtterances])
            
            
            function loadActions() {
                return new Promise(function(resolve,reject) {
                    var actions = {}
                    //console.log(['SHOULD ADD actgs',skill.utterancesLists, skill.utterances])
                    if (Object.keys(usedActions).length > 0) { 
                        actionsStorage.getItem('alldata').then(function(allActions) {
                            if (Array.isArray(allActions)) {
                                allActions.map(function(thisAction) {
                                    if (usedActions[thisAction.value]) {
                                        actions[thisAction.value] = thisAction
                                    }
                                    return null 
                                })
                                //console.log(['SET UITTER GLOLBA',utterances])
                                
                            }
                            resolve(actions)
                        })
                   } else {
                       resolve({})
                   }
                })
            }
            
            //console.log(['USED actions',skill.actions])
            //if (skill.actions && Array.isArray(skill.actions)) {
                //console.log(['USED actions',skill.actions])
                //skill.actions.map(function(action) {
                    //if (action.synonym) {
                        //var remainder = action.synonym
                        //var nextStartPos = remainder.indexOf('say(')
                        //var nextEndPos = remainder.indexOf(')',nextStartPos)
                        //var utterances = []
                        //console.log(['USED actions st',remainder])
                        //while (remainder.length > 0 && nextStartPos !== -1 && nextEndPos !== -1) {
                            //var extract = remainder.slice(nextStartPos,nextEndPos - nextStartPos)
                            //var key = extract.replace('"','','g').replace(";",'','g')
                            //usedUtterances[key] = 1
                            //remainder = remainder.slice(nextEndPos)
                            //nextStartPos = remainder.indexOf('say(')
                            //nextEndPos = remainder.indexOf(')',nextStartPos)
                            //console.log(['USED actions loop',remainder,nextStartPos,nextEndPos])
                        //}
                    //}
                    ////story.steps.map(function(step,stepKey) {
                        
                        ////if (step && step.indexOf('utter ') === 0) {
                            ////var stepName = step.slice(6)
                            ////usedUtterances[stepName] = 1
                        ////} else if (step && step.indexOf('action ') === 0) {
                           ////var stepName = step.slice(7)
                            ////usedActions[stepName] = 1 
                        ////} 
                    ////})
                //})
            //} 
            
            //console.log(['USED',usedActions,usedUtterances,skill])
            
           promises.push(new Promise(function(resolve,reject) {
               loadActions().then(function(actions) {
                    // extract used utterances from actions
                    if (actions) Object.values(actions).map(function(action) {
                        //console.log(['action',action])
                        if (action && Array.isArray(action.responses)) {
                            action.responses.map(function(response) {
                               if (response && response.text && response.text.trim()) usedUtterances[response.text.trim()] = 1
                            })
                            if (Array.isArray(action.apis)) action.apis.map(function(api) {
                               if (api && api.text && api.text.trim()) usedApis[api.text.trim()] = 1
                            })
                        }
                    })
                    
                    
                    var utterances = {}
                    //console.log(['SHOULD ADD UTTS', usedUtterances,skill.utterances])
                    if (Object.keys(usedUtterances).length > 0) { 
                        utterancesStorage.getItem('alldata').then(function(allUtterances) {
                            if (Array.isArray(allUtterances)) {
                                allUtterances.map(function(thisUtterance) {
                                    //console.log(['thisutt',thisUtterance ? thisUtterance.value : ''])
                                    if (usedUtterances[thisUtterance.value]) {
                                        utterances[thisUtterance.value] = thisUtterance
                                    }
                                    return null 
                                })
                                //console.log(['SET UITTER GLOLBA',utterances])
                                
                            }
                            var apis = {}
                            //console.log(['SHOULD ADD apis', usedApis,skill.apis])
                            if (Object.keys(usedApis).length > 0) { 
                                apisStorage.getItem('alldata').then(function(allApis) {
                                    if (Array.isArray(allApis)) {
                                        allApis.map(function(thisApi) {
                                            //console.log(['thisutt',thisApi ? thisApi.value : ''])
                                            if (usedApis[thisApi.value]) {
                                                apis[thisApi.value] = thisApi
                                            }
                                            return null 
                                        })
                                        //console.log(['SET UITTER GLOLBA',utterances])
                                        
                                    }
                                    resolve([actions,utterances,apis])
                                })
                            } else {
                                resolve([actions,utterances,{}])
                            }
                            
                            
                            
                        })
                   } else {
                       resolve([actions,{},{}])
                   }
                })
            }))
                //skill.entitiesData = filledLists
                //skill.utterancesData = utterances                   
            Promise.all(promises).then(function(data) {
                //console.log(['LOIADED LOOKUPS',data])
                var newSkill = skill
                newSkill.entitiesData = data[0]
                newSkill.forms = formLookups
                newSkill.utterances = data && data.length === 2 && data[1] && data[1].length === 3 ?  data[1][1] : {}
                newSkill.actions = data && data.length === 2 && data[1] && data[1].length === 3 ?   data[1][0] : {}
                newSkill.apis = data && data.length === 2 && data[1] && data[1].length === 3 ?   data[1][2] : {}
                //console.log(['resolve JSON',newSkill])
                oresolve(newSkill)
            })
  
        }) 
    })

        
        
                
        //return new Promise(function(oresolve,oreject) {
           ///            
        //})
   
    return outerPromise;
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
