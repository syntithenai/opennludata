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
    
    
    function loadFormActionApi() {
        return new Promise(function(resolve,reject) {
            var allApis = {}
            var allActions = {}
            var allForms = {}
            
            // load the light weight objects and index them
            apisStorage.getItem('alldata').then(function(allApisArray) {
                if (Array.isArray(allApisArray)) {
                    allApisArray.map(function(thisApi) {
                        if (thisApi.value) allApis[thisApi.value] = thisApi
                        return null 
                    })
                }
                //console.log(['apis',allApis])
                actionsStorage.getItem('alldata').then(function(allActionsArray) {
                    if (Array.isArray(allActionsArray)) {
                        allActionsArray.map(function(thisAction) {
                            if (thisAction.value) allActions[thisAction.value] = thisAction
                            return null 
                        })
                    }
                    //console.log(['actions',allActions])
                    formsStorage.getItem('alldata').then(function(allFormsArray) {
                        if (Array.isArray(allFormsArray)) {
                            allFormsArray.map(function(thisForm) {
                                if (thisForm.value) allForms[thisForm.value] = thisForm
                                return null 
                            })
                            //console.log(['forms',allForms])
                            resolve({allForms,allActions,allApis})
                        }
                    })
                })
            })
        })
    }
    
    function fromStoriesAndRules() {
        var usedUtterances = {}
        var usedActions = {}
        var usedApis = {}
        var usedForms = {}
        if (skill && skill.rules && Array.isArray(skill.rules)) {
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
        if (skill && skill.stories && Array.isArray(skill.stories)) {
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
        return {usedActions,usedForms,usedUtterances}
    }
    
    function collateEntities() {
        return new Promise(function(resolve,reject) {
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
        })
    }
    
    
    function collateTheRest() {
        return new Promise(function(resolve,reject) {
            loadFormActionApi().then(function(data) {
                const {allForms,allActions,allApis} = data
                var usedApis = {}
                
                var finalApis = {}
                var finalActions = {}
                var finalForms = {}
                //var finalUtterances = {}
                const {usedUtterances,usedForms,usedActions} = fromStoriesAndRules()
                //console.log(['API loaded stories',allForms,allActions,allApis,usedUtterances,usedForms,usedActions])
                
                function doForm(key) {
                    //console.log(['API DO FORM',key])
                    if (key && allForms[key]  && !finalForms[key]) {
                        var form = allForms[key]
                        finalForms[key] = form
                        if (form.finished) {
                            doAction(form.finished)
                        }
                        if (form.ask) {
                            usedUtterances[form.ask] = 1
                        }
                    }
                }
                
                function doAction(key) {
                    //console.log(['API DO ACTION',key,allActions[key],typeof usedActions[key]])
                    if (key && allActions[key] && !finalActions[key]) {
                        var action = allActions[key]
                        finalActions[key] = action
                        //console.log(['API DO ACTION',action])
                        if (Array.isArray(action.responses)) action.responses.map(function(value) {
                            //console.log(['API DO ACTION utt',value])
                            if (value && value.text) {
                               usedUtterances[value.text] = 1
                            } 
                        })
                        if (Array.isArray(action.forms)) action.forms.map(function(value) {
                            if (value && value.text) {
                               doForm(value.text)
                            } 
                        })
                        if (Array.isArray(action.apis)) action.apis.map(function(value) {
                            if (value && value.text) {
                               doApi(value.text)
                            } 
                        })
                    } 
                }
                
                function doApi(key) {
                    //console.log(['API DO API',key,allApis,usedApis,finalApis])
                    if (key && allApis[key]   && !finalApis[key]) {
                        var api = allApis[key]
                        finalApis[key] = api
                        
                        if (Array.isArray(api.responses)) api.responses.map(function(value) {
                            //console.log(['API DO API utt',value])
                            if (value && value.text) {
                               usedUtterances[value.text] = 1
                            } 
                        })
                        if (Array.isArray(api.forms)) api.forms.map(function(value) {
                            if (value && value.text) {
                               doForm(value.text)
                            } 
                        })
                        if (Array.isArray(api.apis)) api.apis.map(function(value) {
                            if (value && value.text) {
                               doApi(value.text)
                            } 
                        })
                    } 
                }
                
                Object.keys(usedForms).map(function(form) {
                    doForm(form)
                })
                
                
                //console.log(['done forms',usedUtterances,finalForms,finalActions ,finalApis])
                
                
                Object.keys(usedActions).map(function(action) {
                    doAction(action)
                })
                
                
                //console.log(['API done actions',usedUtterances,finalForms,finalActions ,finalApis])
                
                
                
                resolve({usedUtterances,finalForms,finalActions ,finalApis})
            
                
            })
        })
    }
    
    
    return new Promise(function(oresolve,oreject) {
            //console.log(['ALLFORMS',allForms])
        var promises = []    
        
        
        // PROMISE 1 entities - just entities in entity lists
        promises.push(collateEntities())
        
        // PROMISE 2  collate used forms, utterances, actions and apis
        promises.push(collateTheRest())
        
        // collate promises for entities, utterances, actions and apis into skill and resolve
        Promise.all(promises).then(function(data) {
            //console.log(['API DONE PROMISES',data])
            var newSkill = skill
            newSkill.entitiesData = data[0]
            //console.log(['EXPORT JSON',data])
            //console.log(['API EXPORT JSON',data[1]])
            var mixed = data.length > 0 && data[1] ? data[1] : {}
            //const {usedUtterances,finalForms, finalActions,finalApis} = data.length > 0 && data[1] ? data[1] : {usedUtterances:{},finalForms:{}, finalActions:{},finalApis:{}}
            
            
            //console.log(['API',mixed])
            if (mixed) {
                //console.log(['API mixed'])
                newSkill.forms = mixed.finalForms
                newSkill.actions = mixed.finalActions
                newSkill.apis = mixed.finalApis
            }
            //console.log(['EXPORT GOT FORMS',JSON.parse(JSON.stringify(newSkill))])
            // lookup utterances
            //newSkill.utterances = utterances
            utterancesStorage.getItem('alldata').then(function(allUtterancesArray) {
                //console.log(['API UTT',allUtterancesArray,mixed.usedUtterances])
            
                var allUtterances={}
                if (Array.isArray(allUtterancesArray)) {
                    allUtterancesArray.map(function(thisUtterance) {
                        
                        if (thisUtterance.value && mixed.usedUtterances[thisUtterance.value]) {
                            allUtterances[thisUtterance.value] = thisUtterance
                        }
                        return null 
                    })
                }
                //Object.values(
                newSkill.utterances = allUtterances
                console.log(['API DONE EXPORT JSON',newSkill,allUtterances])
                oresolve(newSkill)
            })
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


 
            // also utterances used in forms
            // first build lookups
           //
            
            
            //function loadActions() {
                //return new Promise(function(resolve,reject) {
                    //var actions = {}
                    ////console.log(['SHOULD ADD actgs',skill.utterancesLists, skill.utterances])
                    //if (Object.keys(usedActions).length > 0) { 
                        //actionsStorage.getItem('alldata').then(function(allActions) {
                            //if (Array.isArray(allActions)) {
                                //allActions.map(function(thisAction) {
                                    //if (usedActions[thisAction.value]) {
                                        //actions[thisAction.value] = thisAction
                                    //}
                                    //return null 
                                //})
                                ////console.log(['SET UITTER GLOLBA',utterances])
                                
                            //}
                            //resolve(actions)
                        //})
                   //} else {
                       //resolve({})
                   //}
                //})
            //}
            
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
     




                
                //// utterances used in forms
                //var formLookups = {}
                //allForms.map(function(form) {
                    //if (form && form.value && usedForms[form.value] === 1) {
                        //formLookups[form.value] = form
                        //if (form.finished) usedActions[form.finished] = 1
                    //}
                //})
                //Object.keys(formLookups).map(function(formName) {
                    //var form = formLookups[formName]
                    //if (Array.isArray(form.slots)) form.slots.map(function(slot) {
                       //if (slot && slot.text) {
                           //usedUtterances[slot.text] = 1
                       //} 
                    //})
                //})
                //console.log(['utss plsu form',allForms,usedForms,formLookups,usedUtterances,usedActions])
                
                
                //// extract used utterances from actions
                //if (actions) Object.values(actions).map(function(action) {
                    ////console.log(['action',action])
                    //if (action && Array.isArray(action.responses)) {
                        //action.responses.map(function(response) {
                           //if (response && response.text && response.text.trim()) usedUtterances[response.text.trim()] = 1
                        //})
                        //if (Array.isArray(action.apis)) action.apis.map(function(api) {
                           //if (api && api.text && api.text.trim()) usedApis[api.text.trim()] = 1
                        //})
                    //}
                //})
                
                
                //var utterances = {}
                ////console.log(['SHOULD ADD UTTS', usedUtterances,skill.utterances])
                //if (Object.keys(usedUtterances).length > 0) { 
                    //utterancesStorage.getItem('alldata').then(function(allUtterances) {
                        //if (Array.isArray(allUtterances)) {
                            //allUtterances.map(function(thisUtterance) {
                                ////console.log(['thisutt',thisUtterance ? thisUtterance.value : ''])
                                //if (usedUtterances[thisUtterance.value]) {
                                    //utterances[thisUtterance.value] = thisUtterance
                                //}
                                //return null 
                            //})
                            ////console.log(['SET UITTER GLOLBA',utterances])
                            
                        //}
                        //var apis = {}
                        ////console.log(['SHOULD ADD apis', usedApis,skill.apis])
                        //if (Object.keys(usedApis).length > 0) { 
                            //apisStorage.getItem('alldata').then(function(allApis) {
                                //if (Array.isArray(allApis)) {
                                    //allApis.map(function(thisApi) {
                                        ////console.log(['thisutt',thisApi ? thisApi.value : ''])
                                        //if (usedApis[thisApi.value]) {
                                            //apis[thisApi.value] = thisApi
                                        //}
                                        //return null 
                                    //})
                                    ////console.log(['SET UITTER GLOLBA',utterances])
                                    
                                //}
                                //// scan all used actions for used forms
                                
        
                                //// scan all apis for responses, forms and apis
        
                                
                                //resolve([actions,utterances,apis])
                            //})
                        //} else {
                            //resolve([actions,utterances,{}])
                        //}
                        
                        
                        
                    //})
               //} else {
                   //resolve([actions,{},{}])
               //}
