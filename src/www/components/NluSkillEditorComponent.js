import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import {Fragment, Container, Row, Col, Button, Badge , ListGroup , Tabs, Tab} from 'react-bootstrap'
//import useNluEditor from './useNluEditor'
//import exportFormats from './export/index'
////import {exportJSON} from './export/exportJSON'
//import useDB from './useDB'
import {RASA, GoogleAssistant, Alexa, BuiltinTypes} from '../utils'
import ReactTags from 'react-tag-autocomplete'
import SuggestionComponent from './SuggestionComponent'
import SkillRegexTagComponent from './SkillRegexTagComponent'
import DropDownComponent from './DropDownComponent'
import RASATemplates from '../export/RASATemplates'
//import ExportPage from './ExportPage'
//import PublishPage from './PublishPage' 
//import { saveAs } from 'file-saver';
//import useRestEndpoint from './useRestEndpoint'
import {generateObjectId, uniquifyArray} from '../utils'
       
import localforage from 'localforage'
import Autosuggest from 'react-autosuggest'

import RulesEditor from '../RulesEditor'       
import StoriesEditor from '../StoriesEditor'
          
export default function NluSkillEditorComponent(props) {
    
    const [newIntentName, setNewIntentName] = useState('')
    const [suggestions, setSuggestions] = useState([])
    useEffect(() => {
        // check regexps on load
        if (props.currentSkill && props.currentSkill.entities) {
            Object.keys(props.currentSkill.entities).map(function(entityKey) {
              if (props.currentSkill.entities[entityKey] && Array.isArray(props.currentSkill.entities[entityKey].regexps))  {
                  props.currentSkill.entities[entityKey].regexps.map(function(regexp,rkey) {
                      props.updateRegexp(entityKey,rkey,regexp)  
                  })
              }
            })
        }
    },[])
    //function addAction(actionName,skillId) {
         //console.log(['ADD action',actionName,skillId])
         //return new Promise(function(resolve,reject) {
             ////if (intentName && intentName.trim()) {
                     //var actionsStorage = localforage.createInstance({
                       //name: "nlutool",
                       //storeName   : "actions",
                     //});
                     //actionsStorage.getItem('alldata', function (err,actionsInStorage) {
                         //if (err) throw new Error(err)
                         //var actions = Array.isArray(actionsInStorage) ? actionsInStorage : []
                         //actions.unshift({id:generateObjectId(), value:actionName})
                         //actionsStorage.setItem('alldata',actions)
                         //resolve()
                     //})
                
           ////} else {
               ////resolve()
           ////}
        //})
    //}

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

    
    ////console.log(['skill ',props])
    if (props.skillFilterValue && props.skillFilterValue.length > 0) {
        if (props.filteredItems && props.filteredItems.length > 0) {
           
            //const utteranceTags = props.currentSkill && props.currentSkill.utterances ? props.currentSkill.utterances.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
            //const utteranceListTags = props.currentSkill && props.currentSkill.utterancesLists ? props.currentSkill.utterancesLists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
            var currentSlots = props.currentSkill && props.currentSkill.rasa && props.currentSkill.rasa.slots ? props.currentSkill.rasa.slots : {}
            // ensure slots for entities
            var slots = {}
            if (props.entitiesForSkill) {
                Object.keys(props.entitiesForSkill).map(function(entity) {
                    //console.log(['MESLOT',entity])
                    if (!slots[entity]) {
                        slots[entity] = {slotType:''}
                    }  
                })
            }
            Object.keys(currentSlots).map(function(slotKey) {
                slots[slotKey] =   currentSlots[slotKey]
            })
            
            //slots = Object.assign(newSlots,slots)
            //console.log(['MESLOT rasa ',(props.currentSkill && props.currentSkill.rasa) ? props.currentSkill.rasa : ''])
            //console.log(['MESLOT entforskill',props.entitiesForSkill])
            const skillTags = props.currentSkill && props.currentSkill.tags ? props.currentSkill.tags.map(function(tag,i) {return {id: i, name: tag}}):[]
            return <div>
                        <span style={{float:'left', fontWeight: 'bold', fontSize:'1.7em'}} >{props.skillFilterValue} </span>
                        <div style={{ marginTop:'0.7em', marginBottom:'0.7em'}} >
                            <b style={{marginLeft:'3.5em',marginRight:'1em', float:'left'}} >Tags</b>
                            <span style={{float:'left'}} >
                             <ReactTags
                                placeholderText="Select Tags  "
                                minQueryLength={0}
                                maxSuggestionsLength={50}
                                autoresize={true}
                                allowNew={true}
                                tags={skillTags}
                                suggestions={[]}                           
                                onDelete={function(index) {props.removeSkillTag(index)}}
                                onAddition={function(tag) {props.addSkillTag(tag)}} />
                            </span>
                        </div>
                        
                        
                        <div style={{clear:'both', marginTop:'0.7em', marginBottom:'0.7em', borderTop: '2px solid black'}} >
                            <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Intents</b>
                            <span>{Object.keys(props.collatedItems).sort().map(function(collatedIntent, i) {
                                    var useCurrentIntent = props.currentIntent ? props.currentIntent : Object.keys(props.collatedItems)[0]
                                    var completionVariant = 'danger'
                                    if (props.collatedItems[collatedIntent].length > 300) {
                                        completionVariant = 'success'
                                    } else if (props.collatedItems[collatedIntent].length > 100) {
                                        completionVariant = 'primary'
                                    } else if (props.collatedItems[collatedIntent].length > 10) {
                                        completionVariant = 'warning'
                                    } 
                                    
                                    
                                    if (props.collatedItems[collatedIntent].length  === props.collatedCounts[collatedIntent]) {
                                            return <Link key={collatedIntent} to={"/examples/skill/"+props.skillFilterValue+"/intent/"+collatedIntent.replace('/','_____')} ><Button key={collatedIntent} variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} >
                                                <Badge variant={completionVariant} > {props.collatedItems[collatedIntent].length} </Badge>
                                                &nbsp;{collatedIntent}
                                            </Button></Link>
                                    } else {
                                        return <Link key={collatedIntent} to={"/examples/skill/"+props.skillFilterValue+"/intent/"+collatedIntent.replace('/','_____')} ><Button variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} >
                                                <Badge variant="danger" > {props.collatedItems[collatedIntent].length}/{props.collatedCounts[collatedIntent]} </Badge>
                                                &nbsp;{collatedIntent}
                                            </Button></Link>
                                    }
                                    
                            })}</span>
                            
                            
                           
                            
                             
                            <span style={{marginLeft:'1em'}} >
                            <Autosuggest 
                                suggestions={Object.keys(props.collatedItems).sort().map(function(suggestion) {return {tag: suggestion}})}
                                shouldRenderSuggestions={function() {return true}}
                                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={onSuggestionsClearRequested}
                                getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                renderSuggestion={renderSuggestion}
                                onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                    setNewIntentName(suggestionValue)
                                }}
                                inputProps={{
                                    style:{width:'10em', display:'inline', float:'left'},
                                  value: newIntentName,
                                  onChange: function(e) {setNewIntentName(e.target.value)}
                                }}
                            />&nbsp;<Button  style={{display:'inline'}}  variant="success" onClick={function() {
                                props.addIntent(newIntentName,props.skillFilterValue).then(function() {
                                  var intentExt = newIntentName && newIntentName.trim() ? '/intent/'+newIntentName : ''
                                  setNewIntentName('')
                                  props.history.push('/examples/skill/'+props.skillFilterValue+intentExt)
                                })
                            }}>New Intent Example</Button>
                            </span>
                        </div>
                        
                        
                         {<div style={{marginTop:'0.7em', borderTop: '2px solid black'}} >
                            <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Entities</b><Tabs defaultActiveKey="entity-0" id="entities-tabs">{Object.keys(props.entitiesForSkill).map(function(collatedEntity, i) {
                         
                                const listTags = props.currentSkill && props.currentSkill.entities && props.currentSkill.entities[collatedEntity] && props.currentSkill.entities[collatedEntity].lists ? props.currentSkill.entities[collatedEntity].lists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                                ////console.log(listTags)
                                    return <Tab eventKey={"entity-"+i} title={collatedEntity}  key={collatedEntity}>
                                             <div style={{float:'right'}} >
                                                 <DropDownComponent options={["",...BuiltinTypes.entityTypes]} title="Type" value={props.currentSkill.entities && props.currentSkill.entities[collatedEntity] &&  props.currentSkill.entities[collatedEntity].builtin ? props.currentSkill.entities[collatedEntity].builtin : ''}  selectItem={function(entityType) {
                                                    props.setBuiltinEntityType(collatedEntity,entityType)
                                                }} />&nbsp;&nbsp;
                                                <DropDownComponent options={["",...Alexa.entityTypes]} title="Alexa" value={props.currentSkill.entities && props.currentSkill.entities[collatedEntity] && props.currentSkill.entities[collatedEntity].alexaType ? props.currentSkill.entities[collatedEntity].alexaType : ''} selectItem={function(entityType) {
                                                    props.setAlexaEntityType(collatedEntity,entityType)
                                                }} />
                                                &nbsp;&nbsp;<DropDownComponent options={["",...GoogleAssistant.entityTypes]} title="Google" value={props.currentSkill.entities && props.currentSkill.entities[collatedEntity] &&  props.currentSkill.entities[collatedEntity].googleType ? props.currentSkill.entities[collatedEntity].googleType : ''}  selectItem={function(entityType) {
                                                    props.setGoogleAssistantEntityType(collatedEntity,entityType)
                                                }} />

                                            </div>
                                            
                                            <span style={{marginTop:'0.8em', float:'left', fontWeight:'bold'}}>Values</span>
                                          
                                            <span style={{marginTop:'0.8em',marginLeft:'1em', float:'left'}}>&nbsp;{props.entitiesForSkill[collatedEntity] && props.entitiesForSkill[collatedEntity].values && props.entitiesForSkill[collatedEntity].values.slice(0,5).join(", ")}{props.entitiesForSkill[collatedEntity] && props.entitiesForSkill[collatedEntity].values && props.entitiesForSkill[collatedEntity].values.length > 5 ? <Badge>... {props.entitiesForSkill[collatedEntity] && props.entitiesForSkill[collatedEntity].values && props.entitiesForSkill[collatedEntity].values.length - 5} more </Badge> : ''}</span>
                                            <span style={{marginTop:'0.8em',marginLeft:'1em', float:'left'}}>
                                           
                                                <label><i></i> <ReactTags
                                                placeholderText="Also use values from "
                                                minQueryLength={0}
                                                maxSuggestionsLength={50}
                                                autoresize={true}
                                                allowNew={false}
                                                tags={listTags}
                                                suggestionComponent={SuggestionComponent}
                                                suggestions={props.lookups.listsLookups.map(function(tag,i) {return {id: i, name: tag}})}
                                                onDelete={function(index) {props.removeListFromSkillEntity(collatedEntity, index)}}
                                                onAddition={function(tag) {props.addListToSkillEntity(collatedEntity, tag)}} /> </label>
                                            </span>
                                            
                                            <Container style={{clear:'both'}}>
                                                <Row><Col>
                                                <div ><b>Regular Expressions</b> <Button variant="success" onClick={function(e) {props.addRegexp(collatedEntity)}}  >New Regexp</Button>
                                                {(props.regexpError && props.regexpError.trim()) && <div style={{fontWeight:'bold', color: 'red'}}>{props.regexpError}</div>}
                                                </div>
                                            <div >
                                                {props.currentSkill.entities && props.currentSkill.entities[collatedEntity] &&  Array.isArray(props.currentSkill.entities[collatedEntity].regexps) && <>
                                                        {props.currentSkill.entities[collatedEntity].regexps.map(function(regexp, rkey) {
                                                            return <div key={rkey} style={{clear:'both'}}>
                                                                <input type='text' placeholder='expression' value={regexp.expression ? regexp.expression : ''}   onChange={function(e) {
                                                                    props.updateRegexp(collatedEntity,rkey,Object.assign(regexp,{expression:e.target.value}))}} />
                                                                <Button variant="danger" onClick={function() {props.removeRegexp(collatedEntity,rkey)} } > X </Button>
                                                            </div>
                                                        })}
                                                </>}
                                            </div>
                                            
                                            </Col><Col>
                                            <div ><b>Trims</b> <Button variant="success" onClick={function(e) {props.addTrim(collatedEntity)}}  >New Trim</Button></div>
                                            <div >
                                                {props.currentSkill.entities && props.currentSkill.entities[collatedEntity] &&  Array.isArray(props.currentSkill.entities[collatedEntity].trims) && <>
                                                        {props.currentSkill.entities[collatedEntity].trims.map(function(trim, tkey) {
                                                            return <div key={tkey} style={{clear:'both'}}>
                                                                <select value={trim.type} onChange={function(e) {props.updateTrim(collatedEntity,tkey,Object.assign(trim,{type:e.target.value}))}} >
                                                                    <option>before</option>
                                                                    <option>after</option>
                                                                    <option>between</option>
                                                                    <option>beforeFirst</option>
                                                                    <option>beforeLast</option>
                                                                    <option>afterFirst</option>
                                                                    <option>afterLast</option>
                                                                </select>
                                                                <input type='text' value={Array.isArray(trim.words) && trim.words.length > 0 ? trim.words[0] : ''}   onChange={function(e) {
                                                                    var words = Array.isArray(trim.words) ? trim.words : []
                                                                    words[0] = e.target.value
                                                                    props.updateTrim(collatedEntity,tkey,Object.assign(trim,{words:words}))}} />
                                                                {trim.type === "between" && <> and <input type='text' value={Array.isArray(trim.words) && trim.words.length > 1 ? trim.words[1] : ''}   onChange={function(e) {
                                                                    var words = Array.isArray(trim.words) ? trim.words : []
                                                                    words[1] = e.target.value
                                                                    props.updateTrim(collatedEntity,tkey,Object.assign(trim,{words:words}))}} /></>}
                                                                <Button variant="danger" onClick={function() {props.removeTrim(collatedEntity,tkey)} } > X </Button>
                                                            </div>
                                                        })}
                                                </>}
                                            </div>
                                            
                                            </Col></Row>
                                            </Container>
                                           </Tab>
                                        
                                //}
                                                    

                        })}
                        </Tabs>
                        </div>}
                        
                        
                         <div style={{marginBottom:'1em', marginTop:'0.7em', borderTop: '2px solid black'}} >
                                 <b style={{marginRight:'1em'}} >Slots</b>
                                 <form onSubmit={function(e) {e.preventDefault(); props.newSlot(props.newSlotValue,slots)}} ><input value={props.newSlotValue} onChange={function(e) {props.setNewSlotValue(e.target.value)}} /><Button size="sm" variant="success" onClick={function() {props.newSlot(props.newSlotValue,slots)}}>New Slot</Button>
                                 </form>
                                  <div style={{marginTop:'0.7em'}} ><Container fluid><Row>{Object.keys(slots).map(function(collatedEntity, i) { 
                                      const listTags = props.currentSkill && props.currentSkill.entities && props.currentSkill.entities[collatedEntity] && props.currentSkill.entities[collatedEntity].lists ? props.currentSkill.entities[collatedEntity].lists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                                
                                        return <Col md="4" sm="6" style={{marginTop:'0.5em', border:'1px solid black', backgroundColor:'lightgrey', marginLeft:'0.5em', borderRadius:'10px'}} key={collatedEntity}>
                                                        <span style={{height: '2em', marginTop:'0.5em'}} ><DropDownComponent options={Object.keys(RASA.slotTypes)} title={collatedEntity} value={props.currentSkill.rasa && props.currentSkill.rasa.slots && props.currentSkill.rasa.slots[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity].slotType ? props.currentSkill.rasa.slots[collatedEntity].slotType : 'unfeaturized'} selectItem={function(entityType) {
                                                                props.setRASASlotType(collatedEntity,entityType,slots)
                                                            }} />&nbsp;&nbsp;{props.entitiesForSkill[collatedEntity] &&<DropDownComponent 
                                                                 options={RASA.autofillOptions} 
                                                                 title="autofill" 
                                                                 value={props.currentSkill.rasa && props.currentSkill.rasa.slots && props.currentSkill.entities[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity].slotAutofill && props.currentSkill.rasa.slots[collatedEntity].slotAutofill.trim().length > 0 ? props.currentSkill.rasa.slots[collatedEntity].slotAutofill : 'Yes'} selectItem={function(entityType) {
                                                                props.setRASASlotAutofill(collatedEntity,entityType,slots)
                                                            }} />}{ !(props.entitiesForSkill && props.entitiesForSkill[collatedEntity]) && <Button variant="danger"  size="sm" style={{marginLeft:'0.5em',  fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {props.deleteSlot(collatedEntity,slots)}}>X</Button>}
                                                        </span></Col>
                                            //}
                                            
                                    })}</Row></Container></div>
                            </div>

                        
                       
                        
      
                         <div style={{clear:'both', borderTop: '2px solid black'}}><b>Conversation Flow</b></div>
                        <Tabs defaultActiveKey="rules" id="platform-dialogflow">
                          <Tab eventKey="rules" title="Rules">
                                <div style={{marginTop:'0.7em', marginLeft:'0.4em'}} >
                                    <div style={{clear:'both'}}>
                                         <div style={{marginLeft:'1em'}}>
                                            <RulesEditor createForm={function(form) {return props.addForm(form) }} createAction={function(action) {return props.addAction(action) }} createUtterance={function(utterance) {return props.addUtterance(utterance) }}   skillFilterValue={props.skillFilterValue} lookups={props.lookups} updateFunctions={props.updateFunctions} rules={props.currentSkill.rules} setRules={props.setRules}  intents={Object.keys(props.currentSkill.intents)} entities={Object.keys(props.currentSkill.entities)} utterances={props.lookups.utteranceListsLookups} actions={props.lookups.actionsLookups}/>
                                            
                                        </div>
                                    </div>
                                    
                               </div>
                            </Tab>
                            <Tab eventKey="stories" title="Stories">
                                <div style={{marginTop:'0.7em', marginLeft:'0.4em', borderTop: '2px solid black'}} >
                                    <div style={{clear:'both'}}>
                                         <div style={{marginLeft:'1em'}}>
                                            <StoriesEditor createForm={function(form) {return props.addForm(form) }}  createAction={function(action) {return props.addAction(action) }} createUtterance={function(utterance) {return props.addUtterance(utterance) }}   skillFilterValue={props.skillFilterValue} lookups={props.lookups} updateFunctions={props.updateFunctions} stories={(props.currentSkill && props.currentSkill.stories) ? props.currentSkill.stories : []} setStories={props.setStories} rules={props.currentSkill ? props.currentSkill.rules : []} setRules={props.setRules}  intents={Object.keys(props.currentSkill.intents)} entities={Object.keys(props.currentSkill.entities)} utterances={props.lookups.utteranceListsLookups} actions={props.lookups.actionsLookups}/>
                                            
                                        </div>
                                    </div>
                                    
                               </div>
                            </Tab>
                            
                            
                         </Tabs>
                        
                   
     
               
            </div>
        } else {
            return <b></b>
        }
        
    }
    return []
}
