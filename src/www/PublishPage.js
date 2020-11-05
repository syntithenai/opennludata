//,   Dropdown, ButtonGroup
import {Button } from 'react-bootstrap'
import React, {useEffect} from 'react';
import {Link} from 'react-router-dom'
import localforage from 'localforage'
import {exportJSON} from './export/exportJSON'
import { saveAs } from 'file-saver';


const {qrcode,svg2url} = require('pure-svg-code');


export default  function PublishPage(props) {
 

    if (props.user && props.user.avatar && props.currentSkill && props.currentSkill.title) {
        
        var skillLink = "https://opennludata.org/static/skills/"+props.user.avatar+'-'+props.currentSkill.title+".html"
        const svgString = qrcode(skillLink);
        const url = svg2url(svgString);

        return <div>
        
                 <Link to={"/skills/skill/"+props.currentSkill.title} ><Button variant="success" style={{float:'right'}} >Back to Skill</Button></Link>
                 <h1>Publish</h1>
                    <div>Ready to share your skill - <b>{props.currentSkill.title}</b>,  so other people can chat with your skill as well as download and remix into new skills.</div>
                    <br/>
                    <span style={{width:'30%', float:'right'}}>
                    <img style={{padding:'1em'}} src={url} />
                    <div><Button onClick={function(e) {saveAs(url, 'QRCODE-'+ props.currentSkill.title)}} >Download</Button></div>
                    </span>
                    
                    <div>Your skill will be available to the world at <a target='_new' href={skillLink} >{skillLink}</a></div>
                    <div>You can print and share the QR code containing this link on the right </div>
                    <div style={{fontWeight:'bold'}} >Please note that it can take a few minutes for changes to become available.</div>
                    
                    <br/>
                    <div ><b>By publishing your extension, you are agreeing to the following</b>
                    <ul>
                        <li>Your skill will be available for download under an MIT Open Source License, allowing people to download the data and do whatever they want with it.</li>
                        <li>Your skill will be committed to the <a href="https://github.com/syntithenai/opennludata" target="_new">Github repository</a> </li>
                        <li>Your skill can be unpublished/deleted from the searchable index but will remain in the history of the git repository.</li>
                    </ul>
                    </div>
                    
                    <div>Submitted skills can be found using the search tools on this website. </div>
                    <br/>
                   
                    <div style={{width: '100%',textAlign:'center'}}>
                       {!props.currentSkill._id && <Button variant="success" style={{display:'inline'}} onClick={function(e) {
                           props.startWaiting()
                           exportJSON(props.currentSkill).then(function(skillToSave) {
                               props.saveItem('Skill',skillToSave)
                               //{_id:props.currentSkill._id, id:props.currentSkill.id, title:props.currentSkill.title, json: JSON.stringify(props.currentSkill)})
                               .then(function(res) {
                                   //console.log(['SSKIL created',res]) 
                                   if (res && res.data && res.data._id) {
                                       props.setCurrentSkill(res.data)
                                       props.setMongoId(res.data._id)
                                       props.setPageMessage('Published',3000)
                                       props.stopWaiting()
                                       props.updateFunctions.loadSkills().then(function() {
                                            props.history.push("/skills/skill/"+props.currentSkill.title)
                                       })
                                       ////console.log('updtecurrent skill ',currentSkill)
                                   } 
                                })
                            })
                        }} >Publish {props.currentSkill.title}</Button>}
                       
                       
                       {props.currentSkill._id && <Button variant="success" style={{display:'inline'}} onClick={function(e) {
                           props.startWaiting()
                           exportJSON(props.currentSkill).then(function(skillToSave) {
                               props.saveItem('Skill',skillToSave)
                               //{_id:props.currentSkill._id, id:props.currentSkill.id, title:props.currentSkill.title, json: JSON.stringify(props.currentSkill)})
                               .then(function(res) {
                                   //console.log(['SSKIL updated',res]) 
                                   if (res && res.data && res.data._id) {
                                       props.setCurrentSkill(res.data)
                                       props.setMongoId(res.data._id)
                                       props.setPageMessage('Published',3000)
                                       props.stopWaiting()
                                       props.updateFunctions.loadSkills().then(function() {
                                            props.history.push("/skills/skill/"+props.currentSkill.title)
                                       })
                                   } 
                                })  
                            })  
                        }} >Publish Again</Button>}
                        
                        
                        {props.currentSkill._id && <Button variant="danger" style={{display:'inline'}} onClick={function(e) {
                           props.setMongoId('') 
                           props.startWaiting()
                           props.deleteItem('Skill',props.currentSkill._id).then(function(res) {
                               props.setMongoId(null)
                               //console.log(['SSKIL deleted',res]) 
                                   props.setPageMessage('Unpublished',3000)
                                   props.stopWaiting()
                                   props.updateFunctions.loadSkills().then(function() {
                                        props.history.push("/skills/skill/"+props.currentSkill.title)
                                    })
                           }) 
                           
                        }} >Unpublish</Button>}
                    </div>
           </div>
        } else {
            return null
        }
}
