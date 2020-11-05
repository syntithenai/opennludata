//,   Dropdown, ButtonGroup
import {Button } from 'react-bootstrap'
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
    </div>}</>
}
 //
 /**
  * TODO - invocation, chat history length, docs, description, 
  * 
  */ 
  //{JSON.stringify(Object.keys(currentSkill))}
