//,   Dropdown, ButtonGroup
import {Button, Form } from 'react-bootstrap'
import React, {useEffect,Fragment} from 'react';
import {Link} from 'react-router-dom'
import useSkillsEditor from './useSkillsEditor'
 
export default  function SkillSettingsPage (props) {
    var skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    // share skills editor from props if using inside skills page otherwise independant db connect via skillsEditor
    var currentSkill = skillsEditor.currentSkill
    
    return <>{currentSkill && <div>
             <Link to={"/skills/skill/"+currentSkill.title} ><Button variant="success" style={{float:'right'}} >Back to Skill</Button></Link>
             
            
             <h1>Settings</h1>
             <b>    WORK IN PROGRESS  </b>
             <Form>
              
              <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea"  placeholder="" />
              </Form.Group>
              
              <Form.Group controlId="formInvocation">
                <Form.Label>Invocation</Form.Label>
                <Form.Control type="text" placeholder="" />
                <Form.Text className="text-muted">
                  Used for exporting to JOVO, Alexa and Google home.
                </Form.Text>
              </Form.Group>
              
              <Form.Group controlId="formChatHistory">
                <Form.Label>Maximum lines of chat history to show</Form.Label>
                <Form.Control type="email" placeholder="" />
                <Form.Text className="text-muted">
                  Enter a number larger than zero.
                </Form.Text>
              </Form.Group>
              
              <Form.Group controlId="formHeaderColor">
                <Form.Label>Chat Header Color</Form.Label>
                <Form.Control type="text" placeholder="" />
                
              </Form.Group>
              
              <Form.Group controlId="formChatLogo">
                <Form.Label>Select a logo file</Form.Label>
                <Form.Control type="file" placeholder="" />
                <Form.Text className="text-muted">
                  png, gif or jpg
                </Form.Text>
              </Form.Group>

            </Form>
             
    </div>}</>
}
 //
 /**
  * TODO - invocation, chat history length, docs, description, 
  * 
  */ 
  //{JSON.stringify(Object.keys(currentSkill))}
