//,   Dropdown, ButtonGroup
import {Button, Form , Tabs, Tab, ListGroup} from 'react-bootstrap'
import React, {useEffect,Fragment, useState} from 'react';
import {Link} from 'react-router-dom'
import useSkillsEditor from './useSkillsEditor'
import { SketchPicker } from 'react-color'
import DropDownComponent from './components/DropDownComponent'
import RASATemplates from './export/RASATemplates'
import FileReaderInput from 'react-file-reader-input';


export default  function SkillSettingsPage (props) {
    var skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    // share skills editor from props if using inside skills page otherwise independant db connect via skillsEditor
    var currentSkill = skillsEditor.currentSkill
    
    
    function handleLogoFileSelection(ev, results) {
        ev.preventDefault()
        if (results) {
            results.forEach(result => {
                const [e, file] = result;
                const reader = new FileReader();
                reader.onload = (function(item) { return function(e) { skillsEditor.setConfigValue('logo',e.target.result)}; })();
                reader.readAsDataURL(file)
            
            });
            
        }
    } 
    
    
    
    return <>{currentSkill && <div>
             <Link to={"/skills/skill/"+currentSkill.title} ><Button variant="warning" style={{float:'right'}} >Back to Skill</Button></Link>
             
            
             <h1>Settings</h1>
             <Tabs defaultActiveKey="display" id="skill-settings">
                <Tab eventKey="display" title="Display">
                     <Form>
                      
                      <Form.Group controlId="formDescription">
                        <Form.Label>Help Text</Form.Label>
                        <Form.Control as="textarea"  rows="8" placeholder="" value={currentSkill && currentSkill.config && currentSkill.config.helpText ? currentSkill.config.helpText : ''} onChange={function(e) {skillsEditor.setConfigValue('helpText',e.target.value)} }  />
                      </Form.Group>
                      
                      <Form.Group controlId="formChatHistory">
                        <Form.Label>Maximum lines of chat history to show</Form.Label>
                        <Form.Control type="email" placeholder=""  value={currentSkill && currentSkill.config && currentSkill.config.chatHistory ? currentSkill.config.chatHistory : ''} onChange={function(e) {skillsEditor.setConfigValue('chatHistory',e.target.value)} }  />
                        <Form.Text className="text-muted">
                          Enter a number larger than zero.
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group controlId="formChatLogo">
                        <Form.Label>Select a logo file</Form.Label>
                        
                        <form onSubmit={function(e) {e.preventDefault()}} >
                        <FileReaderInput multiple as="binary" id="my-file-input"
                                         onChange={handleLogoFileSelection}>
                          <Button style={{ marginRight:'0.5em'}} >Select files</Button>
                        </FileReaderInput>
                        {(currentSkill.config && currentSkill.config.logo) && <img style={{width:'100px'}} src={currentSkill.config.logo} />}
                      </form>
                      
                        <Form.Text className="text-muted">
                          png, gif or jpg
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group controlId="formHeaderColor">
                        <Form.Label>Chat Header Color<br/><hr style={{width:'14em', height:'2em', backgroundColor : ((currentSkill.config && currentSkill.config.color) ? currentSkill.config.color : '') }} /></Form.Label>
                        
                        <SketchPicker disableAlpha={true}  color={currentSkill && currentSkill.config ? currentSkill.config.color : ''}  onChangeComplete={function(color) {skillsEditor.setConfigValue('color',color.hex)}} />
                      </Form.Group>
                      

                    </Form>
                     
                
                </Tab>
                
         
                <Tab eventKey="servers" title="Servers">
                     <Form>
                      
                      <Form.Group controlId="formVoiceServer">
                        <Form.Label>Voice Recognition Websocket URL</Form.Label>
                        <Form.Control type="text" placeholder="wss://api.opennludata.org:5000" value={currentSkill && currentSkill.config && currentSkill.config.voiceWebsocketUrl ? currentSkill.config.voiceWebsocketUrl : ''} onChange={function(e) {skillsEditor.setConfigValue('voiceWebsocketUrl',e.target.value)}}  />
                        <Form.Text className="text-muted">
                          Host your own speech recognition service 
                        </Form.Text>
                      </Form.Group>

                      {false && <><Form.Group controlId="formTtsServer">
                        <Form.Label>Text to Speech URL</Form.Label>
                        <Form.Control type="text" placeholder="" value={currentSkill && currentSkill.config && currentSkill.config.ttsUrl ? currentSkill.config.ttsUrl : ''} onChange={function(e) {skillsEditor.setConfigValue('ttsUrl',e.target.value)}} />
                        <Form.Text className="text-muted">
                          Host your own text to speech service 
                        </Form.Text>
                      </Form.Group>

                      <Form.Group controlId="formNluServer">
                        <Form.Label>NLU Server URL</Form.Label>
                        <Form.Control type="text" placeholder="" value={currentSkill && currentSkill.config && currentSkill.config.voiceWebsocketUrl ? currentSkill.config.nluUrl : ''} onChange={function(e) {skillsEditor.setConfigValue('nluUrl',e.target.value)}} />
                        <Form.Label>NLU Server Type</Form.Label>
                        <Form.Control as="select">
                          <option>RASA</option>
                        </Form.Control>
                      </Form.Group></>}

                    </Form>
                     
                
                </Tab>
         
                <Tab eventKey="rasa" title="RASA">
                    <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                        <Tabs defaultActiveKey="config" id="platform-rasa">
                            <Tab eventKey="config" title="Config">
                            <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                              <label>
                            
                                <textarea style={{width:'60em', height:'30em'}}  value={currentSkill && currentSkill.rasa && currentSkill.rasa.config ? currentSkill.rasa.config : RASATemplates.config} onChange={function(e) {skillsEditor.setRasaValue('config',e.target.value)}}  ></textarea>
                              </label>
                            </div>
                              </Tab>
                             
                             <Tab eventKey="credentials" title="Credentials">
                                <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                  <label>
                                
                                    <textarea style={{width:'60em', height:'30em'}}  value={currentSkill && currentSkill.rasa && currentSkill.rasa.credentials ? currentSkill.rasa.credentials : RASATemplates.credentials} onChange={function(e) {skillsEditor.setRasaValue('credentials',e.target.value)}}  ></textarea>
                                  </label>
                            </div>
                              </Tab> 
                                                    
                            <Tab eventKey="endpoints" title="Endpoints">
                                <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                  <label>
                                
                                    <textarea style={{width:'60em', height:'30em'}}  value={currentSkill &&  currentSkill.rasa && currentSkill.rasa.endpoint ? currentSkill.rasa.endpoint : RASATemplates.endpoint} onChange={function(e) {skillsEditor.setRasaValue('endpoint',e.target.value)}}  ></textarea>
                                  </label>
                            </div>
                              </Tab> 
                          
                           <Tab eventKey="session" title="Session Config">
                                <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                  <label>
                                
                                    <textarea style={{width:'60em', height:'30em'}}  value={currentSkill && currentSkill.rasa && currentSkill.rasa.session ? currentSkill.rasa.session : RASATemplates.session} onChange={function(e) {skillsEditor.setRasaValue('session',e.target.value)}}  ></textarea>
                                  </label>
                            </div>
                          </Tab> 
                      
                    </Tabs>
                          
                  </div>  
              </Tab>
              
              <Tab eventKey="mycroft" title="Mycroft">
                <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                   
                </div>
              </Tab>
               <Tab eventKey="jovo" title="JOVO">
                <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                    <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={skillsEditor.invocation} onChange={function(e) {skillsEditor.setInvocation(e.target.value)}} /></label>
                </div>
              </Tab>
              <Tab eventKey="alexa" title="Alexa">
                <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                    <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={skillsEditor.invocation} onChange={function(e) {skillsEditor.setInvocation(e.target.value)}} /></label>
                </div>
              </Tab>
              <Tab eventKey="google_assistant" title="Google Assistant">
                <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                    <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={skillsEditor.invocation} onChange={function(e) {skillsEditor.setInvocation(e.target.value)}} /></label>
                </div>
              </Tab>
                
        </Tabs>
    </div>}</>
}
 //
 /**
  * TODO - invocation, chat history length, docs, description, 
  * 
  */ 
  //{JSON.stringify(Object.keys(currentSkill))}




 //<Tab eventKey="slots" title="Slots">
                                                     //<div style={{marginLeft:'1.4em', marginTop:'0.7em', borderTop: '2px solid black'}} >
                                                         //<form onSubmit={function(e) {e.preventDefault(); props.newSlot(props.newSlotValue,slots)}} ><input value={props.newSlotValue} onChange={function(e) {props.setNewSlotValue(e.target.value)}} /><Button size="sm" onClick={function() {props.newSlot(props.newSlotValue,slots)}}>New Slot</Button>
                                                         //</form>
                                                          //<ListGroup>{Object.keys(slots).map(function(collatedEntity, i) { 
                                                                //return <ListGroup.Item key={collatedEntity} >
                                                                                //<span style={{marginLeft:'1em', float:'left', fontWeight:'bold'}}>&nbsp;{collatedEntity}</span>
                                                                                //<div style={{float:'right'}} >
                                                                                     //{props.entitiesForSkill[collatedEntity] &&  <DropDownComponent 
                                                                                         //options={RASA.autofillOptions} 
                                                                                         //title="Autofill" 
                                                                                         //value={props.currentSkill.rasa && props.currentSkill.rasa.slots && props.currentSkill.entities[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity].slotAutofill && props.currentSkill.rasa.slots[collatedEntity].slotAutofill.trim().length > 0 ? props.currentSkill.rasa.slots[collatedEntity].slotAutofill : 'Yes'} selectItem={function(entityType) {
                                                                                        //props.setRASASlotAutofill(collatedEntity,entityType,slots)
                                                                                    //}} />}
                                                                                    //&nbsp;&nbsp;
                                                                                    //<DropDownComponent options={Object.keys(RASA.slotTypes)} title="Slot" value={props.currentSkill.rasa && props.currentSkill.rasa.slots && props.currentSkill.rasa.slots[collatedEntity] && props.currentSkill.rasa.slots[collatedEntity].slotType ? props.currentSkill.rasa.slots[collatedEntity].slotType : 'unfeaturized'} selectItem={function(entityType) {
                                                                                        //props.setRASASlotType(collatedEntity,entityType,slots)
                                                                                    //}} />
                                                                                    //<Button variant="danger"  size="sm" style={{marginLeft:'0.5em', float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {props.deleteSlot(collatedEntity,slots)}}>X</Button>
                                                                                //</div>
                                                                        //</ListGroup.Item>
                                                                    ////}
                                                                    
                                                            //})}</ListGroup>
                                                    //</div>
                                           
                                      
                                             //</Tab>

