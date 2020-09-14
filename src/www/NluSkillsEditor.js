import React from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import exportFormats from './export/index'
import PublishPage from './PublishPage'
import { saveAs } from 'file-saver';
import NluSkillEditorComponent from './components/NluSkillEditorComponent'

import useSkillsEditor from './useSkillsEditor'

export default  function NluSkillsEditor(props) {

    const skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups}))
    
    const {
    currentSkill, setCurrentSkill, skillFilterValue, setSkillFilterValue,
      skillKeys,
     setMongoId, saveItem, deleteItem, 
       listsForEntity, skillMatches, skillUpdatedMatches, setSkillMatches, setSkillUpdatedMatches, setSkill, forceReload
     } = skillsEditor
   
    
     var skillOptions = skillKeys && skillKeys.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setSkillFilterValue(skillKey)}}  >{skillKey}</Dropdown.Item>
       })
       skillOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {setSkillFilterValue('')}}  >&nbsp;</Dropdown.Item>)
   
        //<Button style={{float:'right',marginLeft:'0.5em'}}  variant="success" onClick={function() {setShowExportDialog(true)}} >Publish</Button>
        // {JSON.stringify(skillMatches)}
     const skillsList = skillKeys ? skillKeys.map(function(skill,i) {return <Button key={i}  onClick={function(e) {setSkillFilterValue(skill)}}  style={{marginLeft:'1em'}} >{skill}</Button>} )   : []
     
     function loadSkill(skill) {
        //console.log(['LOaD SKIL',skill])  
        return new Promise(function(resolve,reject) {
            if (skill && skill.file) {
                //console.log(['LOaD SKIL have file',(process.env.REACT_APP_githubSkillsUrl ? process.env.REACT_APP_githubSkillsUrl : '/static/media/skills/')+skill.file])  
                const axiosClient = props.getAxiosClient()
                axiosClient.get((process.env.REACT_APP_githubSkillsUrl ? process.env.REACT_APP_githubSkillsUrl : '/static/media/skills/')+skill.file).then(function(res) {
                  //console.log(['LOaDed SKIL',res.data])  
                  if (res.data) {
                      ////console.log(res.data)
                      //try {
                          //var data = JSON.parse(res.data)
                          setSkill(res.data)
                          resolve({fileType:'opennlu.skill', created_date: new Date().getTime(), title: res.data.title, data: JSON.stringify(res.data)})
                      //} catch (e) {
                        ////console.log(e)      
                    //}
                  } else {
                      reject('Failed to load skill')  
                  }
                }).catch(function(e) {
                   reject('Failed to load skill')  
                })
            } else {
                reject('Incomplete skill data')
            }
        })
    }
            
    return <div>
 
    <hr/>

        
        {currentSkill && skillUpdatedMatches && skillUpdatedMatches.length > 0 && <span>
                You have a more recent published version of this skill&nbsp;
                {skillUpdatedMatches.map(function(match) {
                    return <span>saved {new Date(match.updated_date).toUTCString()} <Button variant="warning"  onClick={function(e) {loadSkill(match); setSkillUpdatedMatches([]); forceReload()}} >Merge</Button></span>
                })}
        </span>}         
         {currentSkill && !props.publish && skillFilterValue && skillFilterValue.length > 0 && <><Dropdown style={{float:'right',marginLeft:'0.5em'}}  as={ButtonGroup}>
          <Dropdown.Toggle split variant="primary"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant="primary">Export</Button>
          <Dropdown.Menu variant="primary" >
              {exportFormats.map(function(exportFormat,i) {
                  var title = skillFilterValue+'_opennludata_'+exportFormat.name+'_'+Date.now()
                  var variant= exportFormat.name === "JSON" ? "success" : "primary"
                return <Dropdown.Item variant={variant} key={i} value={exportFormat.name} 
                onClick={function(e) {
                    //var skill = currentSkill
                    //skill.intents = 
                    //skill.entities = 
                    exportFormat.exportFunction(currentSkill).then(function(zipBody) {
                        //console.log(['TRIGGER DL',title,zipBody])
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
         {(currentSkill && !props.publish && props.user && props.user.token && props.user.token.access_token ) && <Link to={"/skills/skill/"+currentSkill.title+"/publish"} ><Button variant="success" style={{float:'right'}} >Publish</Button></Link>}
       
       {(currentSkill && !props.publish && !(props.user && props.user.token && props.user.token.access_token)) && <Link to={"/login/login"} ><Button variant="success" style={{float:'right'}} >Login to Publish</Button></Link>}
       
       
        {currentSkill && !props.publish && <NluSkillEditorComponent user={props.user} lookups={props.lookups} {...skillsEditor  } />}
        {!currentSkill && <div>
            <h1>Skills</h1>
            {skillsList.length > 0 && skillsList}
            {skillsList.length <= 0 && <div>
                You dont have any skills yet. Import some <Link to='/sources'><Button>Sources</Button></Link> or <Link to='/search'><Button>Search</Button></Link> the community archive.
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
