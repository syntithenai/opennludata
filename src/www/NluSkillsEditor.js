import React,{useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import exportFormats from './export/index'
import PublishPage from './PublishPage'
import { saveAs } from 'file-saver';
import NluSkillEditorComponent from './components/NluSkillEditorComponent'
import {uniquifyArray} from './utils'
import useSkillsEditor from './useSkillsEditor'
import useImportMergeFunctions from './useImportMergeFunctions'
import ChatPage from './ChatPage'


export default  function NluSkillsEditor(props) {

    const {mergeIntents, updateIntents} = useImportMergeFunctions()
    
    const skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    
    const {
    currentSkill, setCurrentSkill, skillFilterValue, setSkillFilterValue,
      skillKeys, setRules,setStories,
     setMongoId, saveItem, deleteItem, duplicates,
       listsForEntity, skillMatches, skillUpdatedMatches, setSkillMatches, setSkillUpdatedMatches, setSkill, forceReload
     } = skillsEditor
   
    
     
     function tagDuplicates() {
         var newDups = duplicates.map(function(item) {
             //console.log(['tagdup',item])
             if (item) {
                item.tags = Array.isArray(item.tags) ? item.tags : []
                item.tags.push(skillFilterValue + ' duplicate')
                item.tags = uniquifyArray(item.tags)
                //saveItem(item)
             }
             return item
         })
         //console.log(['newdups',newDups])
         return updateIntents(newDups)
     } 
      
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
    
    var width=props.lookups.isBigScreen ? "69%" : "100%"
            
    return <div>
        { (currentSkill && props.lookups.isBigScreen) && <div style={{width:'30%', minHeight:'800px', float:'right', borderLeft:'2px solid black'}}>
        <ChatPage {...props}   user={props.user} currentSkill={currentSkill}    lookups={props.lookups}  startWaiting={props.startWaiting} stopWaiting={props.stopWaiting} updateFunctions={props.updateFunctions}  setPageMessage={props.setPageMessage}  publish={true}   getAxiosClient={props.getAxiosClient} hideBackLink={true} />
                         
        </div>}
        <div style={{width:width, float:'left', marginRight:'3px'}}>
                    
        <hr/>

            
            {currentSkill && skillUpdatedMatches && skillUpdatedMatches.length > 0 && <span>
                    You have a more recent published version of this skill&nbsp;
                    {skillUpdatedMatches.map(function(match) {
                        return <span>saved {new Date(match.updated_date).toUTCString()} <Button variant="warning"  onClick={function(e) {loadSkill(match); setSkillUpdatedMatches([]); forceReload()}} >Merge</Button></span>
                    })}
            </span>}    
            
            {(duplicates && duplicates.length > 0) &&  <Button variant="danger" style={{float:'right',marginLeft:'0.5em'}}  onClick={function(e) {
               tagDuplicates().then(function() {
                props.history.push("/examples/tag/"+skillFilterValue+" duplicate")  
               })
            }}>Duplicates !</Button>}
                 
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
                        //console.log(['EXPORT FUNCTION',exportFormat.exportFunction,exportFormat.name])
                        exportFormat.exportFunction(currentSkill).then(function(zipBody) {
                            //console.log(['TRIGGER DL',title,zipBody])
                            if (exportFormat.name==='JSON') {
                                saveAs(zipBody, title+'.json')
                            } else if (exportFormat.name==='RASA YML') {
                                //console.log(zipBody,title)
                                saveAs(zipBody, title+'.zip')
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
           
           {(currentSkill && !props.publish && !(props.user && props.user.token && props.user.token.access_token)) && <Button variant="success" style={{float:'right'}} onClick={props.doLogin} >{'Login to Publish'}</Button>}
           
           {(!props.lookups.isBigScreen && currentSkill) && <Link to={"/skills/skill/"+currentSkill.title+"/chat"} ><Button variant="warning" style={{float:'right'}}  >{'Chat'}</Button></Link>}
           
           {(currentSkill) && <Link to={"/skills/skill/"+currentSkill.title+"/settings"} ><Button variant="warning" style={{float:'right'}}  >{'Settings'}</Button></Link>}
           
           
          
            
            {currentSkill && !props.publish && <NluSkillEditorComponent history={props.history} user={props.user} lookups={props.lookups} updateFunctions={props.updateFunctions} {...skillsEditor  } />}
            {!currentSkill && <div>
                <h1>Skills</h1>
                {skillsList.length > 0 && skillsList}
                {skillsList.length <= 0 && <div>
                    You dont have any skills yet. Import some <Link to='/sources'><Button>Sources</Button></Link> or <Link to='/search'><Button>Search</Button></Link> the community archive.
                </div>}
            </div>}
             
             {(currentSkill && props.publish ) && <PublishPage {...props} setCurrentSkill={setCurrentSkill} listsForEntity={listsForEntity} forceReload={forceReload}  user={props.user} setMongoId={setMongoId} currentSkill={currentSkill} saveItem={saveItem} deleteItem={deleteItem} />}
         </div>
    </div>
            
}
      


       
         //{!props.publish && renderEditor(props)}
         
         //{props.publish && <div>
             //<Link to={"/skills/skill/"+currentSkill.title} ><Button variant="success" style={{float:'right'}} >Back to Skill</Button></Link>
             //<h1>Publish</h1>
             //<textarea style={{height: '20em', width:'60em'}}  value={JSON.stringify(currentSkill)}></textarea>
             
        //</div>}
