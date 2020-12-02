/* global window */
import React, {useState, useEffect} from 'react';
import {Tabs, Tab, ListGroup, Button, Accordion, Card, AccordionContext, Form, Row, Col, Container} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import DropDownComponent from './components/DropDownComponent'
import DropDownSelectorComponent from './components/DropDownSelectorComponent'
import Autosuggest from 'react-autosuggest'

    

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


function RulesEditor(props) {
    
    //var [triggerIntent]
    var [rules,setRules] = useState([])
    const [searchFilter, setSearchFilter] = useState('')
    const [ruleFilter, setRuleFilter] = useState('')
    const [newRuleName, setNewRuleName] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [formSuggestions, setFormSuggestions] = useState([])
    
    const [newCondition, setNewCondition] = useState('')
    const [conditions, setConditions] = useState([])
    const [intentOptions, setIntentOptions] = useState([])
    const [utteranceOptions, setUtteranceOptions] = useState([])
    
    useEffect(() => {
        //console.log(['col rule intn options',props.intents])
        if (Array.isArray(props.intents)) {
            var groupedIntents = {}
            var nonGroupedIntents = {}
            props.intents.map(function(intent) {
                var parts = intent.split("/")
                if (parts.length > 1) {
                    groupedIntents[parts[0]] = 1
                } else if (parts[0] && parts[0].trim()) {
                    nonGroupedIntents[parts[0]] = 1
                }
                return null
            })
            var final = ['welcome','fallback'].concat(Object.keys(groupedIntents)).concat(Object.keys(nonGroupedIntents))
            //console.log(['col rule intn options',groupedIntents,final])
            setIntentOptions(final)
        }
        
        
        
        //props.lookups.utterancesLookups ? props.lookups.utterancesLookups.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []
        
        //console.log(['col rule utt options',props.intents])
        if (Array.isArray(props.lookups.utterancesLookups)) {
            var grouped = {}
            var nonGrouped = {}
            props.lookups.utterancesLookups.map(function(utt) {
                var parts = utt.split("/")
                if (parts.length > 1) {
                    grouped[parts[0]] = 1
                } else if (parts[0] && parts[0].trim()) {
                    nonGrouped[parts[0]] = 1
                }
                return null
            })
            var final = [].concat(Object.keys(grouped)).concat(Object.keys(nonGrouped))
            //console.log(['col rule utt options',grouped,final])
            setUtteranceOptions(final)
        }
        
        
    },[])
        
    //console.log(['USE EFFECT RULES',props])
    useEffect(() => {
        var newRules = []
        // convert props array of rules to keyed object of rules
        if (Array.isArray(props.rules) && props.rules.length > 0) {
            props.rules.map(function(rule) {
                if (rule && Array.isArray(rule.steps) && rule.steps.length > 0  && rule.steps[0] && rule.steps[0].indexOf('intent ') === 0) {
                    var intentName = rule.steps[0].slice(7)
                    if (intentName) {
                        newRules.push({name: rule.rule, triggerIntent: intentName, steps: rule.steps.slice(1), conditions: rule.conditions})
                    }
                }
            })
            setRules(newRules)
        } else {
            setRules([])
        }
        //console.log(['USE EFFECT RULES',props.rules,rules])
    },[props.rules])
    
    
        
    function toRulesArray() {
        var final = []
        //console.log(['TORULES',Object.values(rules)])
        rules.map(function(rule) {
            //console.log(rule)
           //if (rule.triggerIntent) 
           final.push( {rule:rule.name, steps: [].concat(['intent ' + rule.triggerIntent],rule.steps), conditions: rule.conditions}  )
           return null
        })
        return final
    }

    //function filterUsedInRuleIntents(intents) {
        ////console.log(['filter',intents,rules])
        //var newIntents=[]
        //var usedIntents = {}
            
        //if (rules) {
            //Object.keys(rules).map(function(rule) {
                ////if (rule && Array.isArray(rule.steps) && rule.steps.length > 0 && rule.steps[0]) {
                    //usedIntents[rule] = 1
                    //return null
                ////}
            //})
        //}
        ////console.log(usedIntents)
        //if (Array.isArray(intents)) {
            ////console.log(usedIntents)
            //intents.map(function(intent) {
                //if (!usedIntents[intent]) {
                    //newIntents.push(intent)
                //}  
            //})
        //}
        //return newIntents
    //} 
    
    function save(newRules) {
        setRules(newRules)
        //console.log(['SAVERULES',toRulesArray()])
        props.setRules(toRulesArray())
    }
    
    function setRuleName(ruleKey,ruleName) {
        //console.log(['setrulename',ruleKey,ruleName,rules])
        var newRules = rules
        if (ruleName && newRules[ruleKey]) newRules[ruleKey].name = ruleName
        save(newRules)
    }
    
        
    function addRule(intent) {
        var newRules = rules
        newRules.unshift({name:(newRuleName && newRuleName.trim()) ? newRuleName : intent, triggerIntent: intent, steps:[]})
        setNewRuleName('')
        save(newRules)
    }

    function deleteRule(ruleKey) {
        if (window.confirm('Really delete the rule ?')) {
            //console.log(['del',intent])
            var newRules = rules
            newRules.splice(ruleKey,1)
            save(newRules)
        }
    }


    function moveRuleUp(ruleKey) {
        //console.log(['moveup',ruleKey,rules])
        var newRules = rules
        if (Array.isArray(rules) && ruleKey > 0) {
            const tmp = rules[ruleKey]
            rules[ruleKey] = rules[ruleKey-1]
            rules[ruleKey-1] = tmp
            //console.log(['swapped',JSON.stringify(rules)])
            //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
        }
        save(newRules)
    }

    function moveRuleDown(ruleKey) {
        var newRules = rules
        //console.log(['movedown',ruleKey,rules,rules[ruleKey + 1]])
        if (Array.isArray(rules)  && ruleKey <= rules.length ) {
            const tmp = rules[ruleKey + 1]
            if (tmp) {
                rules[ruleKey + 1] = rules[ruleKey]
                rules[ruleKey] = tmp
                //console.log(['swapped',JSON.stringify(rules)])
            }
            // else console.log('notmpe')
        }
        save(newRules)
    }



    function updateRuleTriggerIntent(ruleKey,intent) {
        //console.log(['update rules step',intent,key,step])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule) {
            newRule.triggerIntent = intent
            newRules[ruleKey] = newRule
            save(newRules)
        }
    }
    
    // STEPS

    function addRuleStep(ruleKey,type) {
        //console.log(['ADDSTEP',ruleKey,type])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule) {
            if (!Array.isArray(newRule.steps)) newRule.steps=[]
            newRule.steps.push(type+' ')
            newRules[ruleKey] = newRule
            //console.log(['ADDSTEP RULES',newRules])
            save(newRules)
        }
    }
    
    function updateRuleStep(ruleKey,key,step) {
        //console.log(['update rules step',intent,key,step])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule.steps) {
            newRule.steps[key] = step
            newRules[ruleKey] = newRule
            save(newRules)
        }
    }
    
    function deleteRuleStep(ruleKey,indexIn) {
        if (window.confirm('Really delete step?')) {
            var newRules = rules
            const index = parseInt(indexIn)
            if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].steps) && index !== NaN ) {
                newRules[ruleKey].steps.remove(index)
            }
            save(newRules)
        }
    }


    function moveRuleStepUp(ruleKey,index) {
        //console.log(['moveup',intent,index,rules])
        var newRules = rules
        if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].steps) && index > 0) {
            const tmp = rules[ruleKey].steps[index]
            rules[ruleKey].steps[index] = rules[ruleKey].steps[index-1]
            rules[ruleKey].steps[index-1] = tmp
            //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
        }
        save(newRules)
    }

    function moveRuleStepDown(ruleKey,index) {
        var newRules = rules
        //console.log(['movedown',intent,index,rules])
        if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].steps)  && index <= rules[ruleKey].steps.length ) {
            const tmp = rules[ruleKey].steps[index + 1]
            if (tmp) {
                rules[ruleKey].steps[index + 1] = rules[ruleKey].steps[index]
                rules[ruleKey].steps[index] = tmp
                //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
            }
            // else console.log('notmpe')
        }
        save(newRules)
    }
    
    
    
    
    
     // CONDITIONS 

    function addRuleCondition(ruleKey,type) {
        //console.log(['ADD cond',ruleKey,type])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule) {
            if (!Array.isArray(newRule.conditions)) newRule.conditions=[]
            newRule.conditions.push(type+' ')
            newRules[ruleKey] = newRule
            //console.log(['ADD cond RULES',newRules])
            save(newRules)
        }
    }
    
    function updateRuleCondition(ruleKey,key,condition) {
        //console.log(['update rules condition',intent,key,condition])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule.conditions) {
            newRule.conditions[key] = condition
            newRules[ruleKey] = newRule
            save(newRules)
        }
    }
    
    function deleteRuleCondition(ruleKey,indexIn) {
        if (window.confirm('Really delete condition?')) {
            var newRules = rules
            const index = parseInt(indexIn)
            if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].conditions) && index !== NaN ) {
                newRules[ruleKey].conditions.remove(index)
            }
            save(newRules)
        }
    }


    function moveRuleConditionUp(ruleKey,index) {
        //console.log(['moveup',intent,index,rules])
        var newRules = rules
        if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].conditions) && index > 0) {
            const tmp = rules[ruleKey].conditions[index]
            rules[ruleKey].conditions[index] = rules[ruleKey].conditions[index-1]
            rules[ruleKey].conditions[index-1] = tmp
            //console.log(['swapped',index,JSON.stringify(rules[intent].conditions)])
        }
        save(newRules)
    }

    function moveRuleConditionDown(ruleKey,index) {
        var newRules = rules
        //console.log(['movedown',intent,index,rules])
        if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].conditions)  && index <= rules[ruleKey].conditions.length ) {
            const tmp = rules[ruleKey].conditions[index + 1]
            if (tmp) {
                rules[ruleKey].conditions[index + 1] = rules[ruleKey].conditions[index]
                rules[ruleKey].conditions[index] = tmp
                //console.log(['swapped',index,JSON.stringify(rules[intent].conditions)])
            }
            // else console.log('notmpe')
        }
        save(newRules)
    }
    
    
    
    
    
    
    
    
    // STEP AUTOCOMPLETE FUNCTIONS
    function searchShowAll() {
        //setSearchResults(Object.values(props.lookups.skills))
    }

  
    // Use your imagination to render suggestions.
    const renderSuggestion = suggestion => (
        <div>
        {suggestion.tag}
        </div>
    );
    // Autosuggest will call this function every time you need to update suggestions.
    function onSuggestionsFetchRequested ({ value }) {
         
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    function  onSuggestionsClearRequested()  {
       setSuggestions([]);
    };

        // Autosuggest will call this function every time you need to update suggestions.
    function onFormSuggestionsFetchRequested ({ value }) {
         setFormSuggestions(props.lookups.formsLookups ? ['None'].concat(props.lookups.formsLookups.filter(function(a) {if (a.indexOf(value) !== -1) {return true} else return false }).sort()) : ['None'])
         
                                    
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    function  onFormSuggestionsClearRequested()  {
       setFormSuggestions([]);
    };

    
    
    return (
        <div>

            <label style={{float:'left'}}>
              <input type='text' value={newRuleName} onChange={function(e) {setNewRuleName(e.target.value)}} />
            </label>
            <label style={{float:'left'}}>
                <DropDownSelectorComponent  
                    variant = {((newRuleName && newRuleName.trim()) ? "success" : "secondary")} 
                    title="New Rule" 
                    options={((newRuleName && newRuleName.trim()) ? (intentOptions) : []) } selectItem = {function(v) {addRule(v)}} /> 
            </label>
            <input style={{marginLeft:'2em'}}  type='text' value={ruleFilter} onChange={function(e) {setRuleFilter(e.target.value)}} placeholder={'Filter rules'} /><Button variant="danger" onClick={function() {setRuleFilter('')}} >X</Button>
            
            
            {Array.isArray(rules) && <div><form onSubmit={function(e) {e.preventDefault(); return false}} >
            
              <Tabs style={{marginLeft: 0, width:'100%' }} defaultActiveKey="rules_0" id="platform-rules">
                          
                {rules.map(function(rule,key) {
                    var triggerIntent  = rule.triggerIntent
                    //console.log(ruleFilter && ruleFilter.trim(),triggerIntent.indexOf(ruleFilter) )
                    if (ruleFilter && ruleFilter.trim() && (triggerIntent.indexOf(ruleFilter) === -1 && (rule && rule.name && rule.name.indexOf(ruleFilter) === -1))) {
                        return null
                    } else {
                        
                        var steps = (Array.isArray(rule.steps) && rule.steps.length > 0) ? rule.steps : []
                       return (
                       <Tab  key={key}  eventKey={"rules_"+key} title={rule && rule.name ? rule.name: 'unnamed rule'}>
                           <div key={key} style={{clear:'both', borderTop:'2px solid black'}}>
                           
                           
                           <hr style={{clear:'both', width:'100%'}} />
                           <Button style={{float:'right', width:'10em', marginBottom:'0.5em'}} size="sm" variant="danger" onClick={function(e) {deleteRule(key)}} > Delete Rule </Button>
                           
                           &nbsp;&nbsp;<Button variant="primary" onClick={function(e) {moveRuleUp(key)}} > ^ </Button> 
                           &nbsp;<Button variant="primary" onClick={function(e) {moveRuleDown(key)}} > v </Button>
                                        
                                        
                            <span><label style={{fontWeight:'bold', marginLeft:'1em'}} >Trigger Intent </label> <DropDownSelectorComponent  variant = "primary" title={triggerIntent} options={intentOptions} selectItem = {function(v) {
                                updateRuleTriggerIntent(key,v)
                            }} /></span>
                            
                           <span  >&nbsp;&nbsp;<label style={{fontWeight:'bold'}} >Description </label> <input size='40' type='text' value={rule.name} onChange={function(e) {setRuleName(key, e.target.value)}} /></span>  
                           
                           
                           
                            
                            
                            
                            <div  style={{clear:'both', width: '100%'}}  >
                                <b>Conditions</b>
                                <div style={{fontWeight:'bold', width: '100%'}} >
                                {rule.conditions && rule.conditions.map(function(step,stepKey) {
                                    var parts = step.split(' ')
                                    var ruleStepType = parts[0].trim()
                                    var ruleStepName = parts.slice(1).join(' ')
                                    //console.log(props.lookups)
                                    var suggestions = []
                                    var createNewLabel = 'Create New Condition'
                                    
                                    return <div  style={{width: '100%'}} key={stepKey} >
                                    <br/>
                                    <span style={{float:'left', clear:'both'}} >
                                        {<Button  variant="danger" onClick={function(e) {e.preventDefault(); deleteRuleCondition(key,stepKey)}} > X </Button>}
                                        
                                        &nbsp;&nbsp;<Button variant="primary" onClick={function(e) {moveRuleConditionUp(key,stepKey)}} > ^ </Button> 
                                        &nbsp;<Button variant="primary" onClick={function(e) {moveRuleConditionDown(key,stepKey)}} > v </Button>
                                       
                                        &nbsp;&nbsp;<b>{ruleStepType.padEnd(12,' ')}&nbsp;&nbsp;</b>
                                    </span>
                                    <span style={{float:'left', width:'20em', display:'inline'}} >
                                           
                                            
                                            {ruleStepType === 'has_slot' && <input style={{float:'left', width:'20em', display:'inline'}} type="text" value={ruleStepName}  onChange={function(e) {updateRuleCondition(key,stepKey,ruleStepType + ' '+e.target.value)}} />}
                                            
                                            {ruleStepType === 'active_form' && <Autosuggest
                                                suggestions={formSuggestions.map(function(suggestion) {return {tag: suggestion}})}
                                                shouldRenderSuggestions={function() {return true}}
                                                onSuggestionsFetchRequested={onFormSuggestionsFetchRequested}
                                                onSuggestionsClearRequested={onFormSuggestionsClearRequested}
                                                getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                                renderSuggestion={renderSuggestion}
                                                onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                                    updateRuleCondition(key,stepKey,ruleStepType + ' '+suggestionValue)
                                                }}
                                                inputProps={{
                                                    style:{width:'30em', display:'inline', float:'left'},
                                                  value: ruleStepName,
                                                  onChange: function(e) {updateRuleCondition(key,stepKey,ruleStepType + ' '+e.target.value)}
                                                }}
                                            />}
                                            
                                    </span>
                                   
                                   </div>
                            })}
                            <span style={{float:'left', clear:'both'}}  ><br/><DropDownSelectorComponent  variant = "success" title={'New Condition'} options={['is_conversation_start','has_slot','active_form']} selectItem = {function(v) {addRuleCondition(key,v)}} /></span>
                            </div> 
                            <span style={{float:'left', clear:'both'}} ><br/><br/></span>
                        </div>
                        
                        
                        <div  style={{clear:'both', width: '100%'}}  >
                            <b>Steps</b>
                            <div style={{fontWeight:'bold', width: '100%'}} >
                            {steps.map(function(step,stepKey) {
                                var parts = step.split(' ')
                                var ruleStepType = parts[0].trim()
                                var ruleStepName = parts.slice(1).join(' ')
                                //console.log(props.lookups)
                                var suggestions = []
                                var createNewLabel = 'Create New '
                                var clickCreate = null //function(e) {}
                                var editLink=''
                                if (ruleStepType === "utter") {
                                    createNewLabel = createNewLabel + 'Utterance '
                                    suggestions = utteranceOptions.sort()
                                    //props.lookups.utterancesLookups ? props.lookups.utterancesLookups.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []
                                    clickCreate = function(e) {
                                        props.createUtterance({name:ruleStepName}).then(function() {
                                                setTimeout(props.updateFunctions.updateUtterances,500)
                                        })
                                    }
                                    editLink = '/utterances/filter/'+ruleStepName+'/fromskill/'+props.skillFilterValue
                                }
                                if (ruleStepType === "action") {
                                    createNewLabel = createNewLabel + 'Action '
                                    suggestions = [].concat((props.actions ? props.actions.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []),['reset','start','finish','listen','nolisten'])

                                    clickCreate = function(e) {
                                        props.createAction(ruleStepName).then(function() {
                                                setTimeout(props.updateFunctions.updateActions,500)
                                        })
                                    }
                                    editLink = '/actions/filter/'+ruleStepName+'/fromskill/'+props.skillFilterValue
                                }
                                
                                if (ruleStepType === "form") {
                                    createNewLabel = createNewLabel + 'Form '
                                    suggestions = props.lookups.formsLookups ? props.lookups.formsLookups.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []
                                    clickCreate = function(e) {
                                        props.createForm(ruleStepName).then(function() {
                                                setTimeout(props.updateFunctions.updateForms,500)
                                        })
                                    }
                                    editLink = '/forms/filter/'+ruleStepName+'/fromskill/'+props.skillFilterValue
                                }
                                if (ruleStepType === "checkpoint") {
                                    createNewLabel = createNewLabel + 'Checkpoint '
                                    suggestions = []
                                }
                                
                                
                                return <div  style={{width: '100%'}} key={stepKey} >
                                <br/>
                                <span style={{float:'left', clear:'both'}} >
                                    {<Button  variant="danger" onClick={function(e) {e.preventDefault(); deleteRuleStep(key,stepKey)}} > X </Button>}
                                    
                                    &nbsp;&nbsp;<Button variant="primary" onClick={function(e) {moveRuleStepUp(key,stepKey)}} > ^ </Button> 
                                    &nbsp;<Button variant="primary" onClick={function(e) {moveRuleStepDown(key,stepKey)}} > v </Button>
                                   
                                    &nbsp;&nbsp;<b>{ruleStepType.padEnd(12,' ')}&nbsp;&nbsp;</b>
                                </span>
                                <span style={{float:'left', width:'50em', display:'inline'}} >
                                       <Autosuggest
                                            suggestions={suggestions.map(function(suggestion) {return {tag: suggestion}})}
                                            shouldRenderSuggestions={function() {return true}}
                                            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                            onSuggestionsClearRequested={onSuggestionsClearRequested}
                                            getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                            renderSuggestion={renderSuggestion}
                                            onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                                updateRuleStep(key,stepKey,ruleStepType + ' '+suggestionValue)
                                            }}
                                            inputProps={{
                                                style:{width:'30em', display:'inline', float:'left'},
                                              value: ruleStepName,
                                              onChange: function(e) {updateRuleStep(key,stepKey,ruleStepType + ' '+e.target.value)}
                                            }}
                                        />
                                        
                                        {(typeof clickCreate === 'function' && suggestions.indexOf(ruleStepName) === -1) && (
                                            <span >{ruleStepName && <Button 
                                                style={{marginLeft:'1em'}} 
                                                onClick={clickCreate}
                                                variant="success">
                                                    {createNewLabel}
                                            </Button>}</span>
                                        )}
                                        
                                        
                                        
                                        {(editLink && suggestions.indexOf(ruleStepName) !== -1) && <Link to={editLink} ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                                </span>
                               
                               </div>
                            })}
                            <span style={{float:'left', clear:'both'}}  ><br/><DropDownSelectorComponent  variant = "success" title={'New Step'} options={['utter','action','form']} selectItem = {function(v) {addRuleStep(key,v)}} /></span>
                            </div> 
                            <span style={{float:'left', clear:'both'}} ><br/><br/></span>
                        </div>
                        
                        
                        
                        
                       </div>
                       </Tab>
                        )
                    }
                    
                })}
                    
                </Tabs>
                            
             </form> </div>}
        </div>
    )
}


export default RulesEditor

