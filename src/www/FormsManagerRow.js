/* global window */
import { Link  } from 'react-router-dom'

import {Button } from 'react-bootstrap'
import React, {useState, useEffect} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTags from 'react-tag-autocomplete'
import useListItemRow from './useListItemRow'
import SuggestionComponent from './components/SuggestionComponent'
import TagComponent from './components/TagComponent'
import checkImage from './images/check.svg'

import brace from 'brace';
import AceEditor from "react-ace";
import 'brace/mode/javascript'
import 'brace/theme/github'
import 'brace/ext/language_tools'
import {generateObjectId, uniquifyArray} from './utils'
import localforage from 'localforage'

import Autosuggest from 'react-autosuggest'

export default function FormsManagerRow(props) {
    const  {item, splitNumber , style} = props;
    const {    
        tags, reactTags,  addListItemData, deleteListItemData, updateListItemData, moveListItemDataUp, moveListItemDataDown,
        addListItemDataItem, deleteListItemDataItem, updateListItemDataItem, moveListItemDataItemUp, moveListItemDataItemDown,
        onTagDelete, onTagAddition, updateExampleContent,updateExampleSynonym,updateExampleField,  selectItem, deselectItem, onListItemTagDelete, onListItemTagAddition
    } = useListItemRow(props.item, props.saveItem, props.splitNumber, props.style, props.lastSelected, props.setLastSelected, props.selectBetween)
 
    const [suggestions, setSuggestions] = useState([])
    const [apiSuggestions, setApiSuggestions] = useState([])
    const [actionSuggestions, setActionSuggestions] = useState([])
    
    useEffect(() => props.updateFunctions.updateLookups(),[])
    
    function addUtterance(utterance) {
         //console.log(['ADD utterance',utterance])
         return new Promise(function(resolve,reject) {
             if (utterance && utterance.name && utterance.name.trim()) {
                if (!props.lookups.utterancesLookups[utterance.name]) {
                     var utteranceStorage = localforage.createInstance({
                       name: "nlutool",
                       storeName   : "utterances",
                     });
                     utteranceStorage.getItem('alldata', function (err,utterances) {
                         if (err) throw new Error(err)
                         if (Array.isArray(utterances)) {
                             utterances.unshift({id:generateObjectId(), value:utterance.name.trim(), synonym:utterance.name.trim(), tags:[]})
                             utteranceStorage.setItem('alldata',utterances)
                             resolve()
                         }
                     })
                } else {
                    resolve()
                }
                
           } else {
               resolve()
           }
        })
    }
    
        function addAction(action) {
        //console.log(['ADD action',action])
        return new Promise(function(resolve,reject) {
            if (action) {
                //var skill = currentSkill;
                //if (!Array.isArray(skill.regexps)) skill.regexps=[]
                //skill.regexps.push({name: regexp.name, synonym: regexp.synonym ,entity:entity})
                ////skill.regexps = uniquifyArray(skill.regexps)
                //setCurrentSkill(skill)  
                //// if this is a new regexp, add it to the main database
                    var actionStorage = localforage.createInstance({
                       name: "nlutool",
                       storeName   : "actions",
                     });
                     actionStorage.getItem('alldata', function (err,actions) {
                         if (err) throw new Error(err)
                         if (Array.isArray(actions)) {
                             actions.unshift({id:generateObjectId(), value:action, synonyms:'', tags:[]})
                             actionStorage.setItem('alldata',actions)
                         }
                     })
                //forceReload()
                props.updateFunctions.setIsChanged(true)
                resolve()
           } else {
               resolve()
           }
        })
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
        if (value && value.trim()) {    
            setSuggestions(props.lookups.utterancesLookups.filter(function (lookup)  {if (lookup.indexOf(value) !== -1) return true; else return false}))
        } else {
            setSuggestions(props.lookups.utterancesLookups)
        }
    };
    function onApiSuggestionsFetchRequested ({ value }) {
         setApiSuggestions(props.lookups.apisLookups)
    };
    function onActionSuggestionsFetchRequested ({ value }) {
        //console.log(['GS fetch']);
        if (value && value.trim()) {    
            var as =props.lookups.actionsLookups.filter(function (lookup)  {if (lookup.indexOf(value) !== -1) return true; else return false})
            //console.log(['GS have value',as]);
            
            setActionSuggestions(as)
        } else {
            //console.log(['GS no value',props.lookups.actionsLookups]);
            setActionSuggestions(props.lookups.actionsLookups)
        }
    };
    // Autosuggest will call this function every time you need to clear suggestions.
    function  onSuggestionsClearRequested()  {
       setSuggestions([]);
    };
    
    function  onApiSuggestionsClearRequested()  {
       setApiSuggestions([]);
    };
 

    function  onActionSuggestionsClearRequested()  {
        //console.log(['GS clear']);
       setActionSuggestions([]);
    };
 

    

       //var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                   <div style={{float:'right'}} > 
                        <Button  variant="danger"  size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {if (window.confirm('Really delete')) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}}} >X</Button>
               
                    </div>
                   
                  <div style={{float:'left'}}>
                     {!item.isSelected && <Button style={{float: 'left'}} size="lg" variant="secondary" onClick={function(e) {selectItem(splitNumber,e)}} ><img style={{height:'1em'}} src={checkImage} alt="Select"  /></Button>}
                      {item.isSelected && <Button style={{float: 'left'}} size="lg" variant="success" onClick={function() {deselectItem(splitNumber)}} ><img style={{height:'1em'}} src={checkImage} alt="Deselect"  /></Button>}
                  </div>
                  
                  <label><span style={{ marginLeft:'0.5em', marginRight:'0.5em', clear:'both'}}>Description </span> <input  size='50'   
                       type='text'  value={item.value}  onChange={function(e) { 
                           updateExampleContent(e.target.value)
                        }} /></label>
                
                   <label style={{float:'right', marginRight:'2em'}} >
                     <span  style={{float:'left', marginRight:'0.5em'}}>Tags </span>
                     <span  style={{float:'left'}}>
                       <ReactTags
                        placeholderText="Add tag"
                        minQueryLength={0}
                        maxSuggestionsLength={50}
                        autoresize={false}
                        allowNew={true}
                        ref={reactTags}
                        tags={tags}
                        tagComponent={function(iprops) {return <TagComponent {...iprops}     lookups={props.lookups}  />}}
                        suggestionComponent={SuggestionComponent}
                        suggestions={props.lookups.formTagsLookups.map(function(listName,i) {return {id: i, name: listName}})}
                        onDelete={onTagDelete.bind(this)}
                        onAddition={onTagAddition.bind(this)} /> 
                        </span>
                    </label>
                    
                    
                    
                     <span style={{float:'left'}}>
                        <label><span style={{float:'left', marginRight:'1em', marginLeft:'1em' }}>Validate Action</span>
                            <span style={{float:'left'}}><Autosuggest
                            suggestions={actionSuggestions.map(function(suggestion) {return {tag: suggestion}})}
                            shouldRenderSuggestions={function() {return true}}
                            onSuggestionsFetchRequested={onActionSuggestionsFetchRequested}
                            onSuggestionsClearRequested={onActionSuggestionsClearRequested}
                            getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                            renderSuggestion={renderSuggestion}
                            onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                if (item) {
                                    updateExampleField('validate',suggestionValue)
                                }
                            }}
                            inputProps={{
                                style:{width:'30em', display:'inline', float:'left'},
                              value: item && item.validate ? item.validate : '',
                              onChange: function(e) {
                                  if (item) {
                                    updateExampleField('validate',e.target.value)
                                  }
                                }
                            }}
                        /></span></label></span>
                        
                        <span style={{float:'left'}}>{(item && item.validate && props.lookups.actionsLookups.indexOf(item.validate) === -1) && (
                            <span >{item.validate && <Button 
                                style={{marginLeft:'1em'}} 
                                onClick={function(e) {
                                    addAction(item.validate).then(function() {
                                        console.log('NOW UPD')
                                            setTimeout(props.updateFunctions.updateActions,500)
                                    })
                                }} variant="success">
                                    Save New
                            </Button>}</span>
                        )}
                        
                        {(item && item.validate && props.lookups.actionsLookups.indexOf(item.validate)  !== -1) && <Link to={'/actions/filter/'+item.validate+ ((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '') + '/fromform/'+item.value } ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                        
                        </span>
                        
                     
                     
                    <span >
                        <label><span style={{float:'left', marginRight:'1em', marginLeft:'1em' }}>Finished Action</span>
                            
                            <span style={{float:'left'}}><Autosuggest
                            suggestions={actionSuggestions.map(function(suggestion) {return {tag: suggestion}})}
                            shouldRenderSuggestions={function() {return true}}
                            onSuggestionsFetchRequested={onActionSuggestionsFetchRequested}
                            onSuggestionsClearRequested={onActionSuggestionsClearRequested}
                            getSuggestionValue={function (suggestion)  {return suggestion.tag}}
                            renderSuggestion={renderSuggestion}
                            onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                if (item) {
                                    updateExampleField('finished',suggestionValue)
                                    
                                    //from suggestions param above - actionSuggestions.map(function(suggestion) {console.log(['GS',suggestion]); return {tag: suggestion}})
                                    
                                    //var newButton = button; 
                                    //newButton.finished = suggestionValue; 
                                    //updateListItemData('slots',buttonKey,newButton)
                                }
                                //updateRuleStep(triggerIntent,key,ruleStepType + ' '+suggestionValue)
                            }}
                            inputProps={{
                                style:{width:'30em', display:'inline', float:'left'},
                              value: item && item.finished ? item.finished : '',
                              onChange: function(e) {
                                  if (item) {
                                      updateExampleField('finished',e.target.value)
                                      //var newButton = button; 
                                      //newButton.finished = e.target.value; 
                                      //updateListItemData('slots',buttonKey,newButton)
                                      //updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                  }
                                }
                            }}
                        /></span></label>
                    </span>
                        
                    <span >
                        {(item && item.finished && props.lookups.actionsLookups.indexOf(item.finished) === -1) && (
                            <span >{item && <Button 
                                style={{marginLeft:'1em'}} 
                                onClick={function(e) {
                                    addAction(item.finished).then(function() {
                                        console.log('NOW UPD')
                                            setTimeout(props.updateFunctions.updateActions,500)
                                    })
                                }} variant="success">
                                    Save New
                            </Button>}</span>
                        )}
                        
                        
                        {(item && item.finished && props.lookups.actionsLookups.indexOf(item.finished)  !== -1) && <Link to={'/actions/filter/'+item.finished+ ((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '') + '/fromform/'+item.value } ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                        
                    </span>
                        
                        
                        
                     
                     
                    {<div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em', float:'left'}}>Slots</span> 
                        <Button style={{marginRight:'0.5em', float:'left'}} variant="success" onClick={function(e) {addListItemData('slots',{value:'',text:'',capturefrom:[]});  }}>New Slot</Button>
                        {Array.isArray(item.slots) && item.slots.map(function(button,buttonKey) {
                            return <div  style={{marginTop:'0.5em', clear:'both' , borderTop:'2px solid black'}} key={buttonKey}>
                            
                                <span style={{float:'left'}} >
                                <Button style={{marginRight:'0.3em'}} variant="danger" onClick={function(e) {deleteListItemData('slots', buttonKey)}} > X </Button>
                                </span>
                               
                                <span style={{float:'left'}}>
                                    <label>Name <input type='text' value={button.value} onChange={function(e) {
                                        var newButton = button
                                        newButton.value = e.target.value
                                        updateListItemData('slots',buttonKey, newButton) 
                                    }} /></label>
                                </span>
                               
                                <span style={{float:'left'}}>
                                <label><span style={{float:'left', marginRight:'1em', marginLeft:'1em' }}>Ask</span>
                                    <span style={{float:'left'}}><Autosuggest
                                    suggestions={suggestions.map(function(suggestion) {return {tag: suggestion}})}
                                    shouldRenderSuggestions={function() {return true}}
                                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                                    getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                    renderSuggestion={renderSuggestion}
                                    onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                        if (button) {
                                            var newButton = button; 
                                            newButton.text = suggestionValue; 
                                            updateListItemData('slots',buttonKey,newButton)
                                        }
                                        //updateRuleStep(triggerIntent,key,ruleStepType + ' '+suggestionValue)
                                    }}
                                    inputProps={{
                                        style:{width:'30em', display:'inline', float:'left'},
                                      value: button ? button.text : '',
                                      onChange: function(e) {
                                          if (button) {
                                              var newButton = button; 
                                              newButton.text = e.target.value; 
                                              updateListItemData('slots',buttonKey,newButton)
                                              //updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                          }
                                        }
                                    }}
                                /></span></label></span>
                                
                                <span style={{float:'left'}}>{(button && button.text && props.lookups.utterancesLookups.indexOf(button.text) === -1) && (
                                    <span >{button.text && <Button 
                                        style={{marginLeft:'1em'}} 
                                        onClick={function(e) {
                                            addUtterance({name:button.text}).then(function() {
                                                    setTimeout(props.updateFunctions.updateUtterances,500)
                                            })
                                        }} variant="success">
                                            Save New
                                    </Button>}</span>
                                )}
                                </span>
                                
                               {(item && item.finished && props.lookups.utterancesLookups.indexOf(button.text)  !== -1) && <Link to={'/utterances/filter/'+button.text+ ((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '') + '/fromform/'+item.value } ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                                
                                
                                
                                
                                
                               <div  style={{marginLeft:'2em', marginTop:'0.5em', clear:'both'}} >
                               
                               <Button variant="success" onClick={function(e) {addListItemDataItem('slots',buttonKey,'capturefrom',{type:'from entity', intentValue:'', entity:'', intent:[],notintent:[]})}} >New Slot Capture</Button>
                               {(button && Array.isArray(button.capturefrom)) && <div>{button.capturefrom.map(function(capture,captureKey) {
                                    return <div key={captureKey} >
                                    <span style={{float:'left'}} >
                                        <Button variant="danger" onClick={function(e) {deleteListItemDataItem('slots',buttonKey,'capturefrom',captureKey)}} > X </Button>
                                        <Button variant="primary"onClick={function(e) {moveListItemDataItemUp('slots',buttonKey,'capturefrom',captureKey)}}  > ^ </Button>
                                        <Button variant="primary" onClick={function(e) {moveListItemDataItemDown('slots',buttonKey,'capturefrom',captureKey)}}  > v </Button>
                                    </span>
                                    
                                    <select style={{marginLeft:'0.4em'}} value={capture.type} onChange={function(e) {
                                        var newCapture = capture
                                        newCapture.type = e.target.value
                                        updateListItemDataItem('slots',buttonKey,'capturefrom',captureKey,newCapture)
                                    }} >
                                    {['from text','from entity','from intent','from trigger intent'].map(function(option,oKey) {
                                        return <option key={oKey} >{option}</option>
                                    })}
                                    </select>
                                   
                                    
                                    {(capture.type === "from entity") && <label style={{marginLeft:'0.4em'}}>Entity 
                                        <select style={{marginLeft:'0.4em'}} value={capture.entity} onChange={function(e) {
                                        var newCapture = capture
                                        newCapture.entity = e.target.value
                                        updateListItemDataItem('slots',buttonKey,'capturefrom',captureKey,newCapture)
                                    }} >
                                    {props.lookups.entityLookups.map(function(option,oKey) {
                                        return <option key={oKey} >{option}</option>
                                    })}
                                    </select>
                                    </label>}
                                    {<label style={{marginLeft:'0.4em'}}>Intent 
                                        
                                        <ReactTags
                                        placeholderText="Select intent"
                                        minQueryLength={0}
                                        maxSuggestionsLength={50}
                                        autoresize={false}
                                        allowNew={false}
                                        ref={null}
                                        tags={capture.intent.map(function(intent,intentKey) {return {i: intentKey, name: intent}} )}
                                        tagComponent={function(iprops) {return <TagComponent {...iprops}     lookups={props.lookups}  />}}
                                        suggestionComponent={SuggestionComponent}
                                        suggestions={props.lookups.intentLookups.map(function(listName,i) {return {id: i, name: listName}})}
                                        onDelete={function(i) { onListItemTagDelete('slots',buttonKey,'capturefrom',captureKey,'intent',i)}} 
                                        onAddition={function(tag) { onListItemTagAddition('slots',buttonKey,'capturefrom',captureKey,'intent',tag && tag.name ? tag.name : '')}} /> 
                                         
                                       
                                    
                                    </label>}
                                    
                                    {(capture.type === "from intent" || capture.value === "from trigger intent") && <label style={{marginLeft:'0.4em'}}>Value <input type='text' value={capture.intentValue} onChange={function(e) {
                                        var newCapture = capture
                                        newCapture.intentValue = e.target.value
                                        updateListItemDataItem('slots',buttonKey,'capturefrom',captureKey,newCapture)
                                    }} /></label>}
                                   
                                    
                                    {<label style={{marginLeft:'0.4em'}}>Not Intent     <ReactTags
                                        placeholderText="Select intent"
                                        minQueryLength={0}
                                        maxSuggestionsLength={50}
                                        autoresize={false}
                                        allowNew={false}
                                        ref={null}
                                        tags={capture.notintent.map(function(intent,intentKey) {return {i: intentKey, name: intent}} )}
                                        tagComponent={function(iprops) {return <TagComponent {...iprops}     lookups={props.lookups}  />}}
                                        suggestionComponent={SuggestionComponent}
                                        suggestions={props.lookups.intentLookups.map(function(listName,i) {return {id: i, name: listName}})}
                                        onDelete={function(i) { onListItemTagDelete('slots',buttonKey,'capturefrom',captureKey,'notintent',i)}} 
                                        onAddition={function(tag) { onListItemTagAddition('slots',buttonKey,'capturefrom',captureKey,'notintent',tag && tag.name ? tag.name : '')}} /> </label>}
                                    </div>
                                    
                                })}</div>}
                               
                               </div>
                               
                               
                            </div>
                                
                        })}
                    </div> }
                   
                    
                    
                    {false &&<><div style={{clear:'both', marginRight:'0.5em'}}>Code</div> 
                        
                      <div style={{}}>  
                          <AceEditor
                          style={{width:'100%',height:'14em',border:'1px solid black'}} 
                            mode="javascript"
                            theme="github"
                            showGutter={false}
                            maxLines={15}
                            minLines={15}
                            enableBasicAutocompletion={true}
                            enableLiveAutocompletion={true}
                            value={item.synonym} 
                            onChange={function(e) {updateExampleSynonym(e)}}
                            name={"aceeditor_"+splitNumber}
                            editorProps={{ $blockScrolling: true }}
                          />
                     </div> 
                    
                    </>}
                  </div> 
               
                
                 
           
      </div>
       
       
}

//{false &&
                                //<Autosuggest
                                    //suggestions={apiSuggestions.map(function(suggestion) {return {tag: suggestion}})}
                                    //shouldRenderSuggestions={function() {return true}}
                                    //onSuggestionsFetchRequested={ onApiSuggestionsFetchRequested}
                                    //onSuggestionsClearRequested={ onApiSuggestionsClearRequested}
                                    //getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                    //renderSuggestion={renderSuggestion}
                                    //onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                        //if (button) {
                                            //var newButton = button; 
                                            //newButton.text = suggestionValue; 
                                            //updateListItemData('apis',buttonKey,newButton)
                                        //}
                                        ////updateRuleStep(triggerIntent,key,ruleStepType + ' '+suggestionValue)
                                    //}}
                                    //inputProps={{
                                        //style:{width:'30em', display:'inline', float:'left'},
                                      //value: button ? button.text : '',
                                      //onChange: function(e) {
                                          //if (button) {
                                              //var newButton = button; 
                                              //newButton.text = e.target.value; 
                                              //updateListItemData('apis',buttonKey,newButton)
                                              ////updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                          //}
                                        //}
                                    //}}
                                ///>}


// setOptions={{
                              //enableBasicAutocompletion: true,
                              //enableLiveAutocompletion: true,
                              //enableSnippets: true,
                              //showLineNumbers: false,
                              //tabSize: 4,
                              //maxLines:5,
                              //minLines:5,
                            //}}
                            
