import React from 'react';
import {Link} from 'react-router-dom'
import {Button, Badge , ListGroup , Tabs, Tab} from 'react-bootstrap'
//import useNluEditor from './useNluEditor'
//import exportFormats from './export/index'
////import {exportJSON} from './export/exportJSON'
//import useDB from './useDB'
import {RASA, GoogleAssistant, Alexa} from '../utils'
import ReactTags from 'react-tag-autocomplete'
import SuggestionComponent from './SuggestionComponent'
import SkillRegexTagComponent from './SkillRegexTagComponent'
import DropDownComponent from './DropDownComponent'
import RASATemplates from '../export/RASATemplates'
//import ExportPage from './ExportPage'
//import PublishPage from './PublishPage'
//import { saveAs } from 'file-saver';
//import useRestEndpoint from './useRestEndpoint'
       
export default function NluSkillEditorComponent(props) {
    //console.log(['skill ',props])
    if (props.skillFilterValue && props.skillFilterValue.length > 0) {
        if (props.filteredItems && props.filteredItems.length > 0) {
           
            const utteranceTags = props.currentSkill && props.currentSkill.utterances ? props.currentSkill.utterances.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
            const utteranceListTags = props.currentSkill && props.currentSkill.utterancesLists ? props.currentSkill.utterancesLists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
            const slots = props.currentSkill && props.currentSkill.rasa && props.currentSkill.rasa.slots ? props.currentSkill.rasa.slots : props.entitiesForSkill;
            const skillTags = props.currentSkill && props.currentSkill.tags ? props.currentSkill.tags.map(function(tag,i) {return {id: i, name: tag}}):[]
            return <div>
                 <div><h3>{props.skillFilterValue} </h3></div>
                    <div style={{marginTop:'0.7em', marginBottom:'0.7em'}} >
                        <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Tags</b>
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
                    </div>
                    <div style={{marginTop:'0.7em', marginBottom:'0.7em', borderTop: '2px solid black'}} >
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
                                        return <Link key={collatedIntent} to={"/examples/skill/"+props.skillFilterValue+"/intent/"+collatedIntent} ><Button key={collatedIntent} variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} onClick={function() {props.setCurrentIntent(collatedIntent)}}>
                                            <Badge variant={completionVariant} > {props.collatedItems[collatedIntent].length} </Badge>
                                            &nbsp;{collatedIntent}
                                        </Button></Link>
                                } else {
                                    return <Link key={collatedIntent} to={"/examples/skill/"+props.skillFilterValue+"/intent/"+collatedIntent} ><Button variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} onClick={function() {props.setCurrentIntent(collatedIntent)}}>
                                            <Badge variant="danger" > {props.collatedItems[collatedIntent].length}/{props.collatedCounts[collatedIntent]} </Badge>
                                            &nbsp;{collatedIntent}
                                        </Button></Link>
                                }
                                
                        })}</span>
                    </div>
                    <div style={{marginTop:'0.7em', borderTop: '2px solid black'}} >
                  <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Entities</b><ListGroup>{Object.keys(props.entitiesForSkill).map(function(collatedEntity, i) {
                            
                           
                            const listTags = props.currentSkill && props.currentSkill.entities && props.currentSkill.entities[collatedEntity] && props.currentSkill.entities[collatedEntity].lists ? props.currentSkill.entities[collatedEntity].lists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                            //console.log(listTags)
                                return <ListGroup.Item key={collatedEntity} >
                                        
                                         <span style={{marginLeft:'1em', float:'left', fontWeight:'bold'}}>&nbsp;{collatedEntity}</span>
                                      
                                        <span style={{marginLeft:'1em', float:'left'}}>&nbsp;{props.entitiesForSkill[collatedEntity] && props.entitiesForSkill[collatedEntity].values && props.entitiesForSkill[collatedEntity].values.slice(0,5).join(", ")}{props.entitiesForSkill[collatedEntity] && props.entitiesForSkill[collatedEntity].values && props.entitiesForSkill[collatedEntity].values.length > 5 ? <Badge>... {props.entitiesForSkill[collatedEntity] && props.entitiesForSkill[collatedEntity].values && props.entitiesForSkill[collatedEntity].values.length - 5} more </Badge> : ''}</span>
                                        <span style={{marginLeft:'1em', float:'left'}}>
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
                                        <div style={{float:'right'}} >
                                            <DropDownComponent options={["",...Alexa.entityTypes]} title="Alexa" value={props.currentSkill.entities && props.currentSkill.entities[collatedEntity] && props.currentSkill.entities[collatedEntity].alexaType ? props.currentSkill.entities[collatedEntity].alexaType : ''} selectItem={function(entityType) {
                                                props.setAlexaEntityType(collatedEntity,entityType)
                                            }} />
                                            &nbsp;&nbsp;<DropDownComponent options={["",...GoogleAssistant.entityTypes]} title="Google" value={props.currentSkill.entities && props.currentSkill.entities[collatedEntity] &&  props.currentSkill.entities[collatedEntity].googleType ? props.currentSkill.entities[collatedEntity].googleType : ''}  selectItem={function(entityType) {
                                                props.setGoogleAssistantEntityType(collatedEntity,entityType)
                                            }} />
                                        </div>
                                    </ListGroup.Item>
                            //}
                                                

                    })}</ListGroup>
                    </div>
                    <div style={{marginTop:'0.7em', marginLeft:'0.4em', borderTop: '2px solid black'}} >
                        <div ><b>Regular Expressions</b></div>
                      <div style={{clear:'both'}}>
                             <div style={{marginLeft:'1em'}}>
                           <ListGroup style={{minWidth:'500px'}}>
                            <ReactTags
                            placeholderText="Select Regular Expression  "
                            minQueryLength={0}
                            maxSuggestionsLength={50}
                            autoresize={true}
                            allowNew={false}
                            tags={props.currentSkill && props.currentSkill.regexps ? props.currentSkill.regexps.map(function(tag,i) {return {id: i, name: tag.name, intent: tag.intent ? tag.intent : '', entity: tag.entity ? tag.entity : '', synonym: tag.synonym}}):[]}
                            tagComponent={function(iprops) {return <SkillRegexTagComponent {...iprops}   setRegexpEntity={props.setRegexpEntity} setRegexpIntent={props.setRegexpIntent}  lookups={props.lookups}  />}}
                            suggestionComponent={SuggestionComponent}
                            suggestions={props.lookups.regexpsLookups ? props.lookups.regexpsCompleteLookups.map(function(tag,i) {return {id: i, name: tag.value, intent: tag.intent ? tag.intent : '', entity: tag.entity ? tag.entity : '', synonym: tag.synonym}}):[]}
                           
                            onDelete={function(index) {props.removeRegexp(index)}}
                            onAddition={function(tag) {props.addRegexp(tag)}} /></ListGroup>
                            </div>
                            
                        </div>
                </div>
  
                   
                    <div style={{marginTop:'0.7em', marginLeft:'0.4em', borderTop: '2px solid black'}} >
                        <div ><b>Utterances</b></div>
                      <div style={{clear:'both'}}>
                             <div style={{marginLeft:'1em'}}>
                            <label>Utterances
                            <ReactTags
                            placeholderText="Use utterance "
                            minQueryLength={0}
                            maxSuggestionsLength={50}
                            autoresize={true}
                            allowNew={true}
                            tags={utteranceTags}
                            suggestionComponent={SuggestionComponent}
                            suggestions={props.lookups.utterancesLookups ? props.lookups.utterancesLookups.map(function(tag,i) {return {id: i, name: tag}}):[]}
                            onDelete={function(index) {props.removeUtterance(index)}}
                            onAddition={function(tag) {props.addUtterance(tag)}} /> </label>
                            </div>
                            
                             <div style={{marginLeft:'1em'}}>
                            <label>Utterance Lists
                            <ReactTags
                            placeholderText="Use utterances from "
                            minQueryLength={0}
                            maxSuggestionsLength={50}
                            autoresize={true}
                            allowNew={false}
                            tags={utteranceListTags}
                            suggestionComponent={SuggestionComponent}
                            suggestions={props.lookups.utteranceTagsLookups ? props.lookups.utteranceTagsLookups.map(function(tag,i) {return {id: i, name: tag}}) : []}
                            onDelete={function(index) {props.removeUtteranceList(index)}}
                            onAddition={function(tag) {props.addUtteranceList(tag)}} /> </label>
                            </div>
                            
                            
                        </div>
                </div>
     
                  <div style={{marginTop:'0.7em', borderTop: '2px solid black'}} >
                    <div><b>Platform</b></div>
                    <Tabs defaultActiveKey="rasa" id="platform-tabs">
                      <Tab eventKey="rasa" title="RASA">
                            <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                                <Tabs defaultActiveKey="slots" id="platform-rasa">
                                    <Tab eventKey="slots" title="Slots">
                                         <div style={{marginLeft:'1.4em', marginTop:'0.7em', borderTop: '2px solid black'}} >
                                             <form onSubmit={function(e) {e.preventDefault(); props.newSlot(props.newSlotValue,slots)}} ><input value={props.newSlotValue} onChange={function(e) {props.setNewSlotValue(e.target.value)}} /><Button size="sm" onClick={function() {props.newSlot(props.newSlotValue,slots)}}>New Slot</Button>
                                             </form>
                                              <ListGroup>{Object.keys(slots).map(function(collatedEntity, i) { 
                                                    return <ListGroup.Item key={collatedEntity} >
                                                                    <span style={{marginLeft:'1em', float:'left', fontWeight:'bold'}}>&nbsp;{collatedEntity}</span>
                                                                    <div style={{float:'right'}} >
                                                                         {props.entitiesForSkill[collatedEntity] &&  <DropDownComponent 
                                                                             options={RASA.autofillOptions} 
                                                                             title="Autofill" 
                                                                             value={props.currentSkill.rasa && props.currentSkill.rasa.slots && props.currentSkill.entities[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity].slotAutofill && props.currentSkill.rasa.slots[collatedEntity].slotAutofill.trim().length > 0 ? props.currentSkill.rasa.slots[collatedEntity].slotAutofill : 'Yes'} selectItem={function(entityType) {
                                                                            props.setRASASlotAutofill(collatedEntity,entityType,slots)
                                                                        }} />}
                                                                        &nbsp;&nbsp;
                                                                        <DropDownComponent options={Object.keys(RASA.slotTypes)} title="Slot" value={props.currentSkill.rasa && props.currentSkill.rasa.slots && props.currentSkill.rasa.slots[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity].slotType ? props.currentSkill.rasa.slots[collatedEntity].slotType : 'unfeaturized'} selectItem={function(entityType) {
                                                                            props.setRASASlotType(collatedEntity,entityType,slots)
                                                                        }} />
                                                                        <Button variant="danger"  size="sm" style={{marginLeft:'0.5em', float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {props.deleteSlot(collatedEntity,slots)}}>X</Button>
                                                                    </div>
                                                            </ListGroup.Item>
                                                        //}
                                                        
                                                })}</ListGroup>
                                        </div>
                               
                          
                                 </Tab>
                                  <Tab eventKey="actions" title="Actions">
                                    <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                      <label>
                                      
                                        <div style={{fontStyle:'italic'}}>One per line, _action will be appended to each line</div>
                                        <textarea style={{width:'40em', height:'10em'}}  value={props.currentSkill.rasa && Array.isArray(props.currentSkill.rasa.actions) ? props.currentSkill.rasa.actions.join("\n") : ''} onChange={function(e) {props.setRASAActions(e.target.value ? e.target.value.split("\n") : [])}} placeholder={`fred
findSname
is_whatsi
blah name`} ></textarea>
                                      </label>
                                </div>
                                  </Tab>
                                   <Tab eventKey="config" title="Config">
                                    <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                      <label>
                                    
                                        <textarea style={{width:'60em', height:'30em'}}  value={props.currentSkill.rasa && props.currentSkill.rasa.config? props.currentSkill.rasa.config : ''} onChange={function(e) {props.setRASAConfig(e.target.value)}} placeholder={RASATemplates.config} ></textarea>
                                      </label>
                                </div>
                                  </Tab>
                                 <Tab eventKey="stories" title="Stories">
                                    <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                      <label>
                                    
                                        <textarea style={{width:'60em', height:'30em'}}  value={props.currentSkill.rasa && props.currentSkill.rasa.stories? props.currentSkill.rasa.stories : ''} onChange={function(e) {props.setRASAStories(e.target.value)}} placeholder={RASATemplates.stories} ></textarea>
                                      </label>
                                </div>
                                  </Tab> 
                                 <Tab eventKey="credentials" title="Credentials">
                                    <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                      <label>
                                    
                                        <textarea style={{width:'60em', height:'30em'}}  value={props.currentSkill.rasa && props.currentSkill.rasa.credentials ? props.currentSkill.rasa.credentials : RASATemplates.credentials} onChange={function(e) {props.setRASACredentials(e.target.value)}}  ></textarea>
                                      </label>
                                </div>
                                  </Tab> 
                                                        
                                <Tab eventKey="endpoints" title="Endpoints">
                                    <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                      <label>
                                    
                                        <textarea style={{width:'60em', height:'30em'}}  value={props.currentSkill.rasa && props.currentSkill.rasa.endpoint? props.currentSkill.rasa.endpoint : RASATemplates.endpoint} onChange={function(e) {props.setRASAEndpoint(e.target.value)}}  ></textarea>
                                      </label>
                                </div>
                                  </Tab> 
                              
                               <Tab eventKey="session" title="Session Config">
                                    <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                      <label>
                                    
                                        <textarea style={{width:'60em', height:'30em'}}  value={props.currentSkill.rasa && props.currentSkill.rasa.session ? props.currentSkill.rasa.session : RASATemplates.session} onChange={function(e) {props.setRASASession(e.target.value)}}  ></textarea>
                                      </label>
                                </div>
                                  </Tab> 
                              
                            </Tabs>
                                  
                          </div>  
                      </Tab>
                      
                      <Tab eventKey="mycroft" title="Mycroft">
                        <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                           <b>not yet</b>
                        </div>
                      </Tab>
                       <Tab eventKey="jovo" title="JOVO">
                        <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                            <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={props.invocation} onChange={function(e) {props.setInvocation(e.target.value)}} /></label>
                        </div>
                      </Tab>
                      <Tab eventKey="alexa" title="Alexa">
                        <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                            <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={props.invocation} onChange={function(e) {props.setInvocation(e.target.value)}} /></label>
                        </div>
                      </Tab>
                      <Tab eventKey="google_assistant" title="Google Assistant">
                        <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                            <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={props.invocation} onChange={function(e) {props.setInvocation(e.target.value)}} /></label>
                        </div>
                      </Tab>
                    </Tabs>
                 </div>
                 
            </div>
        } else {
            return <b></b>
        }
        
    }
    return []
}
