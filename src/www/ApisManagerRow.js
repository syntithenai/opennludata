/* global window */

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
import localforage from 'localforage'

import Autosuggest from 'react-autosuggest'
import { Link  } from 'react-router-dom'

import {Tab,Tabs, Button, Dropdown, ButtonGroup, Modal } from 'react-bootstrap'
import {generateObjectId, uniquifyArray} from './utils'


export default function ApisManagerRow(props) {
        const  {item, splitNumber , style} = props;
       const {    
             tags, reactTags,  addListItemData, deleteListItemData, updateListItemData, moveListItemDataUp, moveListItemDataDown,
        onTagDelete, onTagAddition, updateExampleContent,updateExampleSynonym,  selectItem, deselectItem
        } = useListItemRow(props.item, props.saveItem, props.splitNumber, props.style, props.lastSelected, props.setLastSelected, props.selectBetween)
        const [suggestions, setSuggestions] = useState([])
        const [formSuggestions, setFormSuggestions] = useState([])
        const [apiSuggestions, setApiSuggestions] = useState([])
        const [selectionState,setSelectionState] = useState({start:{row:0,column:0}, end:{row:0,column:0}})
        
        
        const [showModalEditor,setShowModalEditor] = useState(null)
      
    function insertAtCaret(text) {
         if (selectionState && selectionState.start && selectionState.end) { 
            var lines = item && item.synonym ? item.synonym.split("\n") : []
            var startRow = selectionState.start.row > 0 ? selectionState.start.row : 0
            var endRow = selectionState.end.row > 0 ? selectionState.end.row : 0
            var preLines = lines.slice(0,startRow)
            var postLines = lines.slice(endRow + 1)
            var preLine = lines[selectionState.start.row] ? lines[selectionState.start.row] : ''
            var postLine = lines[selectionState.end.row] ? lines[selectionState.end.row] : ''
            //console.log(['INS',JSON.stringify(selectionState),preLine,postLine,preLines,postLines,middle,final])
            //if (preLines && postLines)  {
                var middle = preLine.slice(0,selectionState.start.column) + text + postLine.slice(selectionState.end.column )
                var final = [].concat(preLines,[middle],postLines)
                //console.log([selectionState,preLines,postLines,middle,final])
                
                updateExampleSynonym(final.join("\n"))
            //insertAtCaret(codeTextareaId,'insert utt')
            //}
        }
    }
    
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
    
    // Autosuggest will call this function every time you need to clear suggestions.
    function  onSuggestionsClearRequested()  {
       setSuggestions([]);
    };
    
    function  onApiSuggestionsClearRequested()  {
       setApiSuggestions([]);
    };
    function onApiSuggestionsFetchRequested ({ value }) {
         setApiSuggestions(props.lookups.apisLookups)
    };
    
    function  onFormSuggestionsClearRequested()  {
       setFormSuggestions([]);
    };
    function onFormSuggestionsFetchRequested ({ value }) {
         setFormSuggestions(props.lookups.formsLookups)
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
                       type='text'  value={item.value}  onChange={function(e) { updateExampleContent(e.target.value)}} /></label>
                
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
                        suggestions={props.lookups.apiTagsLookups.map(function(listName,i) {return {id: i, name: listName}})}
                        onDelete={onTagDelete.bind(this)}
                        onAddition={onTagAddition.bind(this)} /> 
                        </span>
                    </label>
                    
                    
                       {<div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em', float:'left'}}>Responses</span> 
                        <Button style={{marginRight:'0.5em', float:'right'}} variant="success" onClick={function(e) {addListItemData('responses',{text:''},true);  }}>Use Response</Button>
                        
                        <Tabs variant="pills" defaultActiveKey="0" id="apiresponsesstabs">
                        {Array.isArray(item.responses) && item.responses.map(function(button,buttonKey) {
                            return <Tab key={buttonKey} eventKey={buttonKey} title={((button && button.text && props.lookups.utterancesLookups.indexOf(button.text) === -1) ? '* ' : '') + (button.text && button.text.trim() ? button.text : 'empty')}><div  style={{marginTop:'0.5em', clear:'both'}}>
                            
                                <span style={{float:'left'}} >
                                <Button style={{marginRight:'0.3em'}} variant="danger" onClick={function(e) {deleteListItemData('responses', buttonKey)}} > X </Button>
                                
                                </span>
                               
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
                                            updateListItemData('responses',buttonKey,newButton)
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
                                              updateListItemData('responses',buttonKey,newButton)
                                              //updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                          }
                                        }
                                    }}
                                /></span>
                                {(button && button.text && props.lookups.utterancesLookups.indexOf(button.text) === -1) && (
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
                                
                                
                                {(button && button.text && props.lookups.utterancesLookups.indexOf(button.text)  !== -1) && <Link to={'/utterances/filter/'+button.text+ ((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '') + '/fromaction/'+item.value } ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                                
                                <Button variant="success" style={{marginLeft:'0.5em'}} onClick={function(e) {
                                    insertAtCaret("response('"+button.text+"').then(function() {\n\n})")
                                }}>Insert at Cursor</Button>
                            </div>
                              </Tab>   
                        })}
                    </Tabs></div>  
                    }
                     
                    {<div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em', float:'left'}}>Forms</span> 
                        <Button style={{marginRight:'0.5em', float:'right'}} variant="success" onClick={function(e) {addListItemData('forms',{text:''},true);  }}>Use Form</Button>
                        <Tabs variant="pills" defaultActiveKey="0" id="apiformstabs">
                        
                        {Array.isArray(item.forms) && item.forms.map(function(button,buttonKey) {
                            return <Tab key={buttonKey} eventKey={buttonKey} title={((button && button.text && props.lookups.formsLookups.indexOf(button.text) === -1) ? '* ' : '') + (button.text && button.text.trim() ? button.text : 'empty') }>
                            <div  style={{marginTop:'0.5em', clear:'both'}} key={buttonKey}>
                            
                                <span style={{float:'left'}} >
                                <Button style={{marginRight:'0.3em'}} variant="danger" onClick={function(e) {deleteListItemData('forms', buttonKey)}} > X </Button>
                                
                                </span>
                               
                                <span style={{float:'left'}}><Autosuggest
                                    suggestions={formSuggestions.map(function(suggestion) {return {tag: suggestion}})}
                                    shouldRenderSuggestions={function() {return true}}
                                    onSuggestionsFetchRequested={onFormSuggestionsFetchRequested}
                                    onSuggestionsClearRequested={onFormSuggestionsClearRequested}
                                    getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                    renderSuggestion={renderSuggestion}
                                    onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                        if (button) {
                                            var newButton = button; 
                                            newButton.text = suggestionValue; 
                                            updateListItemData('forms',buttonKey,newButton)
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
                                              updateListItemData('forms',buttonKey,newButton)
                                              //updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                          }
                                        }
                                    }}
                                /></span>
                                {(button && button.text && props.lookups.formsLookups.indexOf(button.text) === -1) && (
                                    <span >{button.text && <Button 
                                        style={{marginLeft:'1em'}} 
                                        onClick={function(e) {
                                            addUtterance({name:button.text}).then(function() {
                                                    setTimeout(props.updateFunctions.updateForms,500)
                                            })
                                        }} variant="success">
                                            Save New
                                    </Button>}</span>
                                )}
                                
                                
                                {(button && button.text && props.lookups.utterancesLookups.indexOf(button.text)  !== -1) && <Link to={'/utterances/filter/'+button.text+ ((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '') + '/fromaction/'+item.value } ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                                
                                <Button variant="success" style={{marginLeft:'0.5em'}} onClick={function(e) {
                                    insertAtCaret("form('"+button.text+"')")
                                }}>Insert at Cursor</Button>
                            </div>
                            </Tab>
                        })}
                        </Tabs>
                    </div> }
                   
                    
                    
                    {<div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em', float:'left'}}>Apis</span> 
                        <Button style={{marginRight:'0.5em', float:'right'}} variant="success" onClick={function(e) {addListItemData('apis',{text:'',functionCall:''},true)} }>Use Api</Button>
                        
                        <Tabs variant="pills" defaultActiveKey="0" id="apiapistabs">
                        {Array.isArray(item.apis) && item.apis.map(function(button,buttonKey) {
                            var apiFunctions = []
                            if (button && button.text && props.apiFunctions && props.apiFunctions.hasOwnProperty(button.text) && Array.isArray(props.apiFunctions[button.text])) {
                                apiFunctions = props.apiFunctions[button.text]
                            }                          
                            return <Tab key={buttonKey} eventKey={buttonKey} title={(button.text && button.text.trim() ? button.text : 'empty')}>
                            <div  style={{marginTop:'0.5em', clear:'both'}} key={buttonKey}>
                            
                                <span style={{float:'left'}} >
                                <Button style={{marginRight:'0.3em'}} variant="danger" onClick={function(e) {deleteListItemData('apis', buttonKey)}} > X </Button>
                                
                                </span>
                                <span style={{float:'left'}}>
                                    <select value={button ? button.text : ''} onChange={function(e) {
                                          if (button) {
                                              var newButton = button; 
                                              newButton.text = e.target.value 
                                              updateListItemData('apis',buttonKey,newButton)
                                              //updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                          }
                                        }} >
                                        <option key={''} value={''} >{'   '}</option>
                                        {Array.isArray(props.lookups.apisLookups) && props.lookups.apisLookups.sort(function(a,b) {if (a<b) return -1 ; else return 1 }).map(function(suggestion) {
                                            return <option key={suggestion} value={suggestion} >{suggestion}</option>
                                        })}
                                    
                                    </select>
                                
                                
                                
                                </span>
                                
                                  
                                <span style={{float:'left'}}>
                                    <select value={button ? button.functionCall : ''} onChange={function(e) {
                                          if (button) {
                                              var newButton = button; 
                                              newButton.functionCall = e.target.value 
                                              updateListItemData('apis',buttonKey,newButton)
                                              //updateRuleStep(triggerIntent,key,ruleStepType + ' '+e.target.value)
                                          }
                                        }} >
                                        <option key={'empty'} value={''} >{'   '}</option>
                                        {apiFunctions && apiFunctions.sort(function(a,b) {if (a<b) return -1 ; else return 1 }).map(function(suggestion) {
                                            return <option key={suggestion} value={suggestion} >{suggestion}</option>
                                        })}
                                    
                                    </select>
                                
                                
                                
                                </span>
                                
                                
                                {<Dropdown variant="success" style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                                  <Dropdown.Toggle  variant="success"  split   id="dropdown-split-basic" ></Dropdown.Toggle>
                                  <Button  variant="success"   >{'Insert at Cursor'} </Button>
                                  <Dropdown.Menu  variant="success" >
                                      
                                      {button.functionCall && <Dropdown.Item  variant="success" key={'Slot'} value={'Slot'} onClick={function(e) {
                                          insertAtCaret("api('"+button.text+"')."+button.functionCall+"().then(function(result) {slot('slotName',result)})")  
                                      }}  ><b>Slot</b></Dropdown.Item>}
                                      {button.functionCall && <Dropdown.Item  variant="success" key={'Utterance'} value={'Utterance'} onClick={function(e) {
                                          insertAtCaret("api('"+button.text+"')."+button.functionCall+"().then(function(result) {response(result).then(function() {\n\n})})")  
                                      }}  ><b>Utterance</b></Dropdown.Item>}
                                      <Dropdown.Item  variant="success" key={'Constructor'} value={'Constructor'} onClick={function(e) {
                                          insertAtCaret("api('"+button.text+"')")  
                                      }}  ><b>Constructor</b></Dropdown.Item>
                                      
                                      
                                  </Dropdown.Menu>
                                </Dropdown>}
                            </div>
                           </Tab>     
                        })}
                        </Tabs>
                    </div> }
                    
                    <div style={{clear:'both', marginRight:'0.5em'}}>
                    Code
                    {props.codeError && <b style={{marginLeft:'1em'}} >{props.codeError}</b>}
                    
                    </div> 
                        
                      <div style={{borderBottom: '1px solid black'}}>  
                          <AceEditor
                          style={{width:'100%',border:'1px solid black'}} 
                            mode="javascript"
                            theme="github"
                            showGutter={false}
                            minLines={30}
                            enableBasicAutocompletion={true}
                            enableLiveAutocompletion={true}
                            onSelectionChange={function(s,e) {
                                //console.log(s.getRange())
                                setSelectionState(s.getRange())
                            }}
                            onCursorChange={function(s,e) {
                                //console.log(['CC',s.getRange()])
                                setSelectionState(s.getRange())
                            }}
                            value={item.synonym ? item.synonym : "// return object containing api functions\nreturn {\n    test : function() {\n        console.log(test)\n     }\n}"} 
                            onChange={function(e) {updateExampleSynonym(e)}}
                            name={"aceeditor_"+splitNumber}
                            editorProps={{ $blockScrolling: true }}
                          />
                     </div> 
                    
                    
                  </div> 
               
                
                 
           
      </div>
}
