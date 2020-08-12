import React, {useState, useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button, Dropdown, Badge,ButtonGroup, ListGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import useNluEditor from './useNluEditor'
import exportFormats from './export/index'
import {exportJSON} from './export/exportJSON'
import useDB from './useDB'
import {generateObjectId, uniquifyArray} from './utils'
import ReactTags from 'react-tag-autocomplete'
import SuggestionComponent from './components/SuggestionComponent'
//import ExportPage from './ExportPage'
import { saveAs } from 'file-saver';

import localforage from 'localforage'
//const RenderRow = function(props) {
    //const index = props.index
    //const style = props.style
    //const item = props.data.items[index]
    //return <NluSkillsRow  
         //item={item}  splitNumber={index} style={style}
         //saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         //lookups={props.data.lookups} />
//}


export default  function NluSkillsEditor(props) {
    const {items, loadAll, skillFilterValue, setSkillFilterValue, filteredItems} = useNluEditor('nlutool','examples','alldata', props.updateLookups)
    const [currentIntent, setCurrentIntent] = useState('')
    const [invocation, setInvocation] = useState('')
    const [entitiesForSkill, setEntitiesForSkill] = useState({})
    const [listsForEntity, setListsForEntity] = useState({})
    const [currentSkill, setCurrentSkill] = useState({id:generateObjectId(), invocation:'', title:skillFilterValue, entities:{}})
    //const skillsManager = useDB('nlutool','skills')
    const listsManager = useDB('nlutool','lists')
    const [showExportDialog, setShowExportDialog] = useState(false)
    const [collatedItems, setCollatedItems] = useState({})
    const [collatedCounts, setCollatedCounts] = useState({})
    var skillsStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "skills",
     });
    //const params = useParams()
    //skillFilterValue = params.skillId;
    //function setSkillFilterValueWrap(value) {
        //setSkill
        //props.history.push('/skills/'+value)
    //}
    //const {loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter} = 
    
    // load all on init
    useEffect(() => {
        loadAll()
        //skillsManager.loadAll()
        if (skillFilterValue) {
            //localforage.setItem('key', 'value', function (err) {
              //// if err is non-null, we got an error
              skillsStorage.getItem(skillFilterValue, function (err, skill) {
                // if err is non-null, we got an error. otherwise, value is the value
                if (err) throw new Error(err)
                if (skill) {
                    setCurrentSkill(skill)
                    setInvocation(skill.invocation)
                }
              });
            //});
        } 
        listsManager.loadAll()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    // load skill on change skillFilterValue
    useEffect(() => {
        //skillsManager.loadAll()
        if (skillFilterValue) {
            //localforage.setItem('key', 'value', function (err) {
              //// if err is non-null, we got an error
              skillsStorage.getItem(skillFilterValue, function (err, skill) {
                // if err is non-null, we got an error. otherwise, value is the value
                if (err) throw new Error(err)
                if (skill) {
                    setCurrentSkill(skill)
                    setInvocation(skill.invocation)
                }
              });
            //});
        } 
        
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[skillFilterValue])
    //// set current skill
    //useEffect(() => {
       //if (skillFilterValue && skillFilterValue.length > 0) {
            ////console.log(['LOAD ALL real ',skillFilterValue,skillsManager.items]) 
            //var filtered = skillsManager.items.filter(function(item) {
                ////console.log(['skill filter  ',item.title === skillFilterValue,item])
                ////return true
                //if (item.title === skillFilterValue) return true
                //else return false
            //})
            ////console.log(['LOAD ALL filtered ',filtered])
            //if (filtered.length > 0) {
                //var skill = filtered[0]
                ////skill.entities = Object.keys(entitiesForSkill).map(function(entity) {
                    ////entity.lists = listsForEntity[entity] ? listsForEntity[entity] : []
                    ////return entity
                ////})
                //setCurrentSkill(skill)
                //setInvocation(skill.invocation)
            //}
        //}
    //},[skillsManager.items,skillFilterValue])
    
    // load list lookups
    useEffect(() => {
        if (listsManager.items.length > 0) { 
            //console.log(['UPD ITEMS',listsManager.items,listsManager.items[0]])
            props.updateLists(listsManager.items[0])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[listsManager.items])
    
    // collate entitiesForSkills from filtered example 
    useEffect(() => {
        var entities = {}
        
        filteredItems.map(function (item,itemKey) {
          if (Array.isArray(item.entities)) {
              item.entities.map(function(entity,entityKey) {
                 if (entity && entity.type && entity.type.length > 0) {
                     if (typeof entities[entity.type] !== "object") entities[entity.type] = {}
                     if (!Array.isArray(entities[entity.type].values )) entities[entity.type].values = []
                     entities[entity.type].values.push(entity.value)
                 }
                 return null
              })
          }
          return null
        })
        // sort and uniquify
        Object.keys(entities).map(function(entityName,entityKey) {
           const entity = entities[entityName]
           entity.values = uniquifyArray(entity.values).sort()
           return null
        })
        setEntitiesForSkill(entities)
        
        // examples collated by intent
         var newCollatedItems = collatedItems
         var newCollatedCounts = collatedCounts
         if (filteredItems) {
             filteredItems.map(function(item) {
                if (item.intent) {
                    if (!newCollatedItems[item.intent]) newCollatedItems[item.intent]=[]
                    newCollatedCounts[item.intent] =   (newCollatedCounts[item.intent] > 0) ? newCollatedCounts[item.intent] + 1 : 1;
                    //if (collatedItems[item.intent].length < 300) {
                        newCollatedItems[item.intent].push({example: item.example, entities: item.entities})
                    //}
                    
                }
               return null;  
             })
             setCollatedItems(newCollatedItems)
             setCollatedCounts(newCollatedCounts)
             console.log(['UDPATE SKILL WITH INTENTS',currentSkill, collatedItems])
             var newSkill = currentSkill;
             newSkill.intents = collatedItems
             setCurrentSkill(newSkill)
             console.log(['UDPATE SKILL WITH INTENTS',JSON.parse(JSON.stringify(newSkill))])
         }   
        
        
    },[filteredItems])
    
     // load invocation into skill
    useEffect(() => {
        if (currentSkill) {
          //console.log(['SET INVOCK HAVE CURRENT SKILL',currentSkill,invocation])
          var skill = currentSkill
          skill.invocation = invocation
          setCurrentSkill(skill)
          //skillsManager.saveItem(currentSkill,null)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[invocation])
    
    useEffect(() => {
        console.log('change cs or inv',currentSkill)
        if (currentSkill && currentSkill.title && currentSkill.title.length > 0) {
            console.log('change cs or inv real')
            //var index = skillsManager.findKeyBy('id',newCurrentSkill.id)
            //if (index != null) {
            // merge in entity values
            if (entitiesForSkill) {
                Object.keys(entitiesForSkill).map(function(entity) {
                   if (currentSkill.entities && currentSkill.entities[entity]) {
                       currentSkill.entities[entity].values = entitiesForSkill[entity].values;
                   }  
                })
            }
            // merge in intents
            
            console.log(['save skill ',skillFilterValue,currentSkill])
            skillsStorage.setItem(skillFilterValue, currentSkill, function (err) {
                console.log(['saved skill '])
                if (err)  {
                    console.log(err)
                    throw new Error(err)
                }
            })
              //// if err is non-null, we got an error
            
            //skillsManager.saveItem(newCurrentSkill,index)
            //}
            //
            //currentSkill.entities = entitiesForSkill
            //newCurrentSkill.invocation = invocation;
            //newCurrentSkill.title = skillFilterValue;
            //console.log(['save now ',index,newCurrentSkill])
            //setCurrentSkill(newCurrentSkill)
            
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentSkill,listsForEntity, invocation])
    
  
  
  //function setInvocation(val) {
      //console.log('SET INVOCK')
      ////if (currentSkill) {
          ////console.log(['SET INVOCK HAVE CURRENT SKILL',currentSkill,val])
          ////var skill = currentSkill
          ////skill.invocation = val 
          ////setCurrentSkill(skill)
      ////}
  //}
    
  function addListToSkillEntity(entity,list) {
      //console.log(['ADSKOI',currentSkill,currentSkill.entities,entity,list])
      if (entity && list && list.name) {
            var skill = currentSkill;
            if (!skill.entities) skill.entities={}
            if (!skill.entities[entity]) skill.entities[entity] = {lists:[]}
            if (!Array.isArray(skill.entities[entity].lists)) skill.entities[entity].lists = []
            //var newListsForEntity = listsForEntity
            //console.log(['ADSKOI1.5',skill])
            skill.entities[entity].lists.push(list.name)
            skill.entities[entity].lists = uniquifyArray(skill.entities[entity].lists).sort()
           //newListsForEntity[entity] = uniquifyArray(newListsForEntity).sort()
            setCurrentSkill(skill)  
            // force render
            setListsForEntity(JSON.stringify(skill.entities))  
            //} else {
                //console.log(['ADSKOI new'])
               //newListsForEntity[entity] = [list.name]
            //}
             //console.log(['ADSKOI2 final',newListsForEntity])
            //setListsForEntity(newListsForEntity)
       } else {
           console.log([' missing data'])
       }
  }
  
  function removeListFromSkillEntity(entity, listIndex) {
      var skill = currentSkill
      //console.log(['REMOVESKILLFROMLIST',entity,listIndex])
      if (skill && skill.entities && entity && skill.entities[entity] && skill.entities[entity].lists) {
          var lists = skill.entities[entity].lists
          //lists = uniquifyArray([lists.slice(0, listIndex),lists.slice(listIndex + 1)]).sort()
          lists = lists.slice(0, listIndex).concat(lists.slice(listIndex + 1))
          
          skill.entities[entity].lists = lists
          setCurrentSkill(skill)  
          setListsForEntity(JSON.stringify(skill.entities))  
          //console.log(['REMOVESKILLFROMLIST ddd',lists])
      } 
       //var newEntitiesForSkill = entitiesForSkill
       //if (newEntitiesForSkill[entity]) {
           //var lists = newEntitiesForSkill[entity].lists && Array.isArray(newEntitiesForSkill[entity].lists) ? newEntitiesForSkill[entity].lists : [];
           //newEntitiesForSkill[entity].lists = uniquifyArray([lists.slice(0, listIndex),lists.slice(listIndex + 1)]).sort()
           //setEntitiesForSkill(newEntitiesForSkill)
       //}
  }
  
    
    function renderEditor(props) {
       
        if (skillFilterValue && skillFilterValue.length > 0) {
            
            // filter rendered list using callback 
            //var filteredItems = filter(function(item) {
                //if (!searchFilter || searchFilter.length <=0 ) return true;
                //const matchSearchFilter = item.example.indexOf(searchFilter) !== -1 
                        //|| item.intent.indexOf(searchFilter) !== -1 
                        //|| (item.tags && item.tags.indexOf(searchFilter) !== -1)
                //return matchSearchFilter && skillFilterValue && item.skills && item.skills.indexOf(skillFilterValue) !== -1
                
            //})
             
                
                
            if (filteredItems && filteredItems.length > 0) {
               
               //var tagOptions = props.lookups.tagLookups && props.lookups.tagLookups.sort().map(function(tagKey,i) {
                  //return <Dropdown.Item key={i} value={tagKey} onClick={function(e) {setTagAllValue(tagKey); tagAll(tagKey)}}  >{tagKey}</Dropdown.Item>
               //})
               //var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
                  //return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {setIntentAllValue(intentKey);intentAll(intentKey)}}  >{intentKey}</Dropdown.Item>
               //})
                //CURRENT SKILL: {JSON.stringify(currentSkill)}
                //<hr/>
                
                
                //GENENT: {JSON.stringify(entitiesForSkill)}
                //<hr/>
                //LISTS: {JSON.stringify(listsForEntity)}
                //<hr/>
                
                // {<ExportPage showExportDialog={showExportDialog} setShowExportDialog={setShowExportDialog} currentSkill={currentSkill} />}
                 return <div>
                    CURRENT SKILL: {JSON.stringify(currentSkill.intents)}
                <hr/>
                
                       <div><h3>{skillFilterValue} </h3></div>
                        <div>
                        <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={invocation} onChange={function(e) {setInvocation(e.target.value)}} /></label>
                        </div>
                        
                        
                        <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Intents</b>
                        <span>{Object.keys(collatedItems).sort().map(function(collatedIntent, i) {
                                var useCurrentIntent = currentIntent ? currentIntent : Object.keys(collatedItems)[0]
                                var completionVariant = 'danger'
                                if (collatedItems[collatedIntent].length > 300) {
                                    completionVariant = 'success'
                                } else if (collatedItems[collatedIntent].length > 100) {
                                    completionVariant = 'primary'
                                } else if (collatedItems[collatedIntent].length > 10) {
                                    completionVariant = 'warning'
                                } 
                                
                                
                                if (collatedItems[collatedIntent].length  === collatedCounts[collatedIntent]) {
                                        return <Link key={collatedIntent} to={"/examples/skill/"+skillFilterValue+"/intent/"+collatedIntent} ><Button key={collatedIntent} variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} onClick={function() {setCurrentIntent(collatedIntent)}}>
                                            <Badge variant={completionVariant} > {collatedItems[collatedIntent].length} </Badge>
                                            &nbsp;{collatedIntent}
                                        </Button></Link>
                                } else {
                                    return <Link key={collatedIntent} to={"/examples/skill/"+skillFilterValue+"/intent/"+collatedIntent} ><Button variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} onClick={function() {setCurrentIntent(collatedIntent)}}>
                                            <Badge variant="danger" > {collatedItems[collatedIntent].length}/{collatedCounts[collatedIntent]} </Badge>
                                            &nbsp;{collatedIntent}
                                        </Button></Link>
                                }
                                
                        })}</span>
                        <div style={{marginTop:'0.7em'}} >
                      <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Entities</b><ListGroup>{Object.keys(entitiesForSkill).map(function(collatedEntity, i) {
                                
                                const listTags = currentSkill && currentSkill.entities && currentSkill.entities[collatedEntity] && currentSkill.entities[collatedEntity].lists ? currentSkill.entities[collatedEntity].lists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                                //console.log(listTags)
                                    return <ListGroup.Item key={collatedEntity} >
                                            
                                             <span style={{marginLeft:'1em', float:'left', fontWeight:'bold'}}>&nbsp;{collatedEntity}</span>
                                          
                                            <span style={{marginLeft:'1em', float:'left'}}>&nbsp;{entitiesForSkill[collatedEntity].values.slice(0,5).join(", ")}</span>
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
                                            onDelete={function(index) {removeListFromSkillEntity(collatedEntity, index)}}
                                            onAddition={function(tag) {addListToSkillEntity(collatedEntity, tag)}} /> </label>
                                            </span>
                                        </ListGroup.Item>
                                //}
                                
                        })}</ListGroup>
                        </div>
               
                </div>

            }
            
        } else {
            const skillsList = props.lookups.skillLookups ? props.lookups.skillLookups.map(function(skill,i) {return <Button key={i}  onClick={function(e) {setSkillFilterValue(skill)}}  style={{marginLeft:'1em'}} >{skill}</Button>} )   : []
            return <div>
                <h1>Skills</h1>
                {skillsList.length > 0 && skillsList}
                {skillsList.length <= 0 && <div>
                    You dont have any skills yet. Import some <Link to='/sources'><Button>Sources</Button></Link> 
                </div>}
            </div>
        }
    }
    
    
     var skillOptions = props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setSkillFilterValue(skillKey)}}  >{skillKey}</Dropdown.Item>
       })
       skillOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {setSkillFilterValue('')}}  >&nbsp;</Dropdown.Item>)
   
        //<Button style={{float:'right',marginLeft:'0.5em'}}  variant="success" onClick={function() {setShowExportDialog(true)}} >Publish</Button>
         
    return <div>
         {skillFilterValue && skillFilterValue.length > 0 && <Dropdown style={{float:'right',marginLeft:'0.5em'}}  as={ButtonGroup}>
          <Dropdown.Toggle split variant="success"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant="success">Export</Button>
          <Dropdown.Menu variant="success" >
              {exportFormats.map(function(exportFormat,i) {
                  var title = 'opennludata_'+exportFormat.name+'_'+Date.now()
                return <Dropdown.Item variant="success" key={i} value={exportFormat.name} onClick={function(e) {exportFormat.exportFunction(currentSkill).then(function(zipBody) {
                saveAs(zipBody, title)
            })}}  >{exportFormat.name}</Dropdown.Item>
           })}
          </Dropdown.Menu>
        </Dropdown>}
         {renderEditor(props)}
    </div>
            
}
      
