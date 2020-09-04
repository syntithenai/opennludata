import React, {useState, useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button, Dropdown, Badge,ButtonGroup, ListGroup , Tabs, Tab} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import useNluEditor from './useNluEditor'
import exportFormats from './export/index'
//import {exportJSON} from './export/exportJSON'
import useDB from './useDB'
import {generateObjectId, uniquifyArray, RASA, GoogleAssistant, Alexa} from './utils'
import ReactTags from 'react-tag-autocomplete'
import SuggestionComponent from './components/SuggestionComponent'
import TagComponent from './components/TagComponent'
import DropDownComponent from './components/DropDownComponent'
import RASATemplates from './export/RASATemplates'
//import ExportPage from './ExportPage'
import PublishPage from './PublishPage'
import { saveAs } from 'file-saver';
import useRestEndpoint from './useRestEndpoint'
import NluSkillEditorComponent from './components/NluSkillEditorComponent'

import useSkillsEditor from './useSkillsEditor'

import localforage from 'localforage'

export default  function NluSkillsEditor(props) {

    const skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups}))
    
    const {setAlexaEntityType,setGoogleAssistantEntityType,  removeListFromSkillEntity, addListToSkillEntity,
    currentSkill, setCurrentSkill, skillFilterValue, invocation, setInvocation, entitiesForSkill, collatedItems, collatedCounts, setCurrentIntent, setSkillFilterValue,
     addRegexp, removeRegexp, setRegexpIntent, setRegexpEntity, addRegexpUtteranceTags, skillKeys,
     removeUtterance, addUtterance,  addUtteranceList, removeUtteranceList, setMongoId, saveItem, deleteItem, searchItems,
     newSlot, newSlotValue,    setNewSlotValue,  slots, setRASASlotAutofill, setRASASlotType, deleteSlot ,
     setRASAActions, setRASASession , setRASAEndpoint , setRASACredentials  ,setRASAStories ,setRASAConfig,
     filteredItems, currentIntent,  listsForEntity, listsManager, collatedTags, skillMatches, skillUpdatedMatches, setSkillMatches, setSkillUpdatedMatches, setSkill, forceReload
     } = skillsEditor
   
    
     var skillOptions = skillKeys && skillKeys.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setSkillFilterValue(skillKey)}}  >{skillKey}</Dropdown.Item>
       })
       skillOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {setSkillFilterValue('')}}  >&nbsp;</Dropdown.Item>)
   
        //<Button style={{float:'right',marginLeft:'0.5em'}}  variant="success" onClick={function() {setShowExportDialog(true)}} >Publish</Button>
        // {JSON.stringify(skillMatches)}
     const skillsList = skillKeys ? skillKeys.map(function(skill,i) {return <Button key={i}  onClick={function(e) {setSkillFilterValue(skill)}}  style={{marginLeft:'1em'}} >{skill}</Button>} )   : []
            
    return <div>
        {currentSkill && skillMatches && skillMatches.length > 0 && <span style={{color:'red'}} >
                You have published version of this skill&nbsp;
                {skillMatches.map(function(match,key) {
                    return <span key={key} >saved {new Date(match.updated_date).toUTCString()} <Button variant="warning" onClick={function(e) {setSkill(match); setSkillMatches([]); forceReload()}} >Merge</Button></span>
                })}
        </span>}
        
        {currentSkill && skillUpdatedMatches && skillUpdatedMatches.length > 0 && <span>
                You have a more recent published version of this skill&nbsp;
                {skillUpdatedMatches.map(function(match) {
                    return <span>saved {new Date(match.updated_date).toUTCString()} <Button variant="warning"  onClick={function(e) {setSkill(match); setSkillUpdatedMatches([]); forceReload()}} >Merge</Button></span>
                })}
        </span>}         
         {currentSkill && !props.publish && skillFilterValue && skillFilterValue.length > 0 && <><Dropdown style={{float:'right',marginLeft:'0.5em'}}  as={ButtonGroup}>
          <Dropdown.Toggle split variant="primary"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant="primary">Export</Button>
          <Dropdown.Menu variant="primary" >
              {exportFormats.map(function(exportFormat,i) {
                  var title = skillFilterValue+'_opennludata_'+exportFormat.name+'_'+Date.now()
                return <Dropdown.Item variant="primary" key={i} value={exportFormat.name} 
                onClick={function(e) {
                    //var skill = currentSkill
                    //skill.intents = 
                    //skill.entities = 
                    exportFormat.exportFunction(currentSkill).then(function(zipBody) {
                        console.log(['TRIGGER DL',title,zipBody])
                        if (exportFormat.name==='JSON') {
                            saveAs(zipBody, title+'.json')
                        } else {
                            saveAs(zipBody, title+'.zip')
                        }
                })}}  >{exportFormat.name}</Dropdown.Item>
           })}
          </Dropdown.Menu>
        </Dropdown>
       </>
         }
         {(currentSkill && !props.publish ) && <Link to={"/skills/skill/"+currentSkill.title+"/publish"} ><Button variant="success" style={{float:'right'}} >Publish</Button></Link>}
       
        {currentSkill && !props.publish && <NluSkillEditorComponent user={props.user} lookups={props.lookups} {...skillsEditor  } />}
        {!currentSkill && <div>
            <h1>Skills</h1>
            {skillsList.length > 0 && skillsList}
            {skillsList.length <= 0 && <div>
                You dont have any skills yet. Import some <Link to='/sources'><Button>Sources</Button></Link> 
            </div>}
        </div>}
         
         {(currentSkill && props.publish ) && <PublishPage {...props} setCurrentSkill={setCurrentSkill} listsForEntity={listsForEntity} forceReload={forceReload}  user={props.user} setMongoId={setMongoId} currentSkill={currentSkill} saveItem={saveItem} deleteItem={deleteItem} />}
     
    </div>
            
}
      


       
         //{!props.publish && renderEditor(props)}
         
         //{props.publish && <div>
             //<Link to={"/skills/skill/"+currentSkill.title} ><Button variant="success" style={{float:'right'}} >Back to Skill</Button></Link>
             //<h1>Publish</h1>
             //<textarea style={{height: '20em', width:'60em'}}  value={JSON.stringify(currentSkill)}></textarea>
             
        //</div>}
