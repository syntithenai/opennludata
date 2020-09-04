//,   Dropdown, ButtonGroup
import {Button } from 'react-bootstrap'
import React, {useEffect} from 'react';
import {Link} from 'react-router-dom'
import localforage from 'localforage'

export default  function PublishPage(props) {

    var listsStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "lists",
     });
     var utterancesStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "utterances",
     });
     
    useEffect(() => {
        
        // entities
        if (props.currentSkill && props.currentSkill.entities) {
             listsStorage.getItem('alldata').then(function(dbEntities) {
                 var usedLists = {}
                 var filledLists = {}
                 console.log(props.currentSkill.entities)
                 if (props.currentSkill && props.currentSkill.entities) {
                     Object.values(props.currentSkill.entities).map(function(entity) {
                        if (entity.lists) entity.lists.map(function(list) {
                            usedLists[list] = true  
                        })  
                        return null
                     })
                     console.log(['USEDLISTS',usedLists])
                     Object.keys(usedLists).map(function(useList) {
                         filledLists[useList] = dbEntities.filter(function(item) {if (item.tags && item.tags.indexOf(useList) !== -1) return true; else return false }).map(function(iitem) {
                             return {value:iitem.value, synonym: iitem.synonym}  
                         })
                     })
                     console.log(['FILLEDLISTS',filledLists])
                      var skill = props.currentSkill
                      skill.entitiesListsData = filledLists
                      props.setCurrentSkill(skill)
                      props.forceReload()
                      console.log(['SETSKILL',JSON.parse(JSON.stringify(skill))])
                 }
             })
            
        }
        // utterances
        if (props.currentSkill && props.currentSkill.utterances) {
             utterancesStorage.getItem('alldata').then(function(dbUtterances) {
                 var usedLists = {}
                 var filledLists = {}
                 console.log(props.currentSkill.utterances)
                 if (props.currentSkill && props.currentSkill.utterancesLists) {
                     Object.values(props.currentSkill.utterancesLists).map(function(utterance) {
                        usedLists[utterance] = true  
                        return null
                     })
                     console.log(['USEDLISTS',usedLists])
                     Object.keys(usedLists).map(function(useList) {
                         filledLists[useList] = dbUtterances.filter(function(item) {if (item.tags && item.tags.indexOf(useList) !== -1) return true; else return false }).map(function(iitem) {
                             return {value:iitem.value, synonym: iitem.synonym}  
                         })
                     })
                     console.log(['FILLEDLISTS',filledLists])
                      var skill = props.currentSkill
                      skill.utterancesListsData = filledLists
                      props.setCurrentSkill(skill)
                      props.forceReload()
                      console.log(['SETSKILL',JSON.parse(JSON.stringify(skill))])
                 }
             })
            
        }
        
    },[])
     

    return <div>
             <Link to={"/skills/skill/"+props.currentSkill.title} ><Button variant="success" style={{float:'right'}} >Back to Skill</Button></Link>
             <h1>Publish</h1>
                <div>Ready to share your skill - <b>{props.currentSkill.title}</b>,  so other people can download and remix your intents, entities and utterances into new skills.</div>
                <br/>
                <div ><b>By publishing your extension, you are agreeing to the following</b>
                <ul>
                    <li>Your skill will be available for download under an MIT Open Source License, allowing people to download the data and do whatever they want with it.</li>
                </ul>
                </div>
                
                <div>Submitted skills can be found using the search tools on this website. Community data is also regularly commited to the <a href="https://github.com/syntithenai/opennludata_data" target="_new">Github repository</a> </div>
                <br/>
               
                <div style={{width: '100%',textAlign:'center'}}>
                   {!props.currentSkill._id && <Button variant="success" style={{display:'inline'}} onClick={function(e) {
                       props.saveItem('Skill',props.currentSkill)
                       //{_id:props.currentSkill._id, id:props.currentSkill.id, title:props.currentSkill.title, json: JSON.stringify(props.currentSkill)})
                       .then(function(res) {
                           console.log(['SSKIL created',res]) 
                           if (res && res.data && res.data._id) {
                               props.setCurrentSkill(res.data)
                               props.setMongoId(res.data._id)
                               props.setPageMessage('Published',3000)
                               props.history.push("/skills/skill/"+props.currentSkill.title)
                               //console.log('updtecurrent skill ',currentSkill)
                           } 
                        })  
                    }} >Publish {props.currentSkill.title}</Button>}
                   
                   
                   {props.currentSkill._id && <Button variant="success" style={{display:'inline'}} onClick={function(e) {
                       props.saveItem('Skill',props.currentSkill)
                       //{_id:props.currentSkill._id, id:props.currentSkill.id, title:props.currentSkill.title, json: JSON.stringify(props.currentSkill)})
                       .then(function(res) {
                           console.log(['SSKIL updated',res]) 
                           if (res && res.data && res.data._id) {
                               props.setCurrentSkill(res.data)
                               props.setMongoId(res.data._id)
                               props.setPageMessage('Published',3000)
                               props.history.push("/skills/skill/"+props.currentSkill.title)
                           } 
                        })  
                    }} >Publish Again</Button>}
                    
                    
                    {props.currentSkill._id && <Button variant="danger" style={{display:'inline'}} onClick={function(e) {
                       props.setMongoId('') 
                       props.deleteItem('Skill',props.currentSkill._id).then(function(res) {
                           props.setMongoId(null)
                           console.log(['SSKIL deleted',res]) 
                               props.setPageMessage('Unpublished',3000)
                            props.history.push("/skills/skill/"+props.currentSkill.title)
                       }) 
                       
                    }} >Unpublish</Button>}
                </div>
       </div>
}
