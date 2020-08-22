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
import { saveAs } from 'file-saver';


import localforage from 'localforage'
//const RenderRow = function(props) {
    //const index = props.index
    //const style = props.style
    //const item = props.data.items[index]
    //return <NluSkillsRow  
         //item={item}  splitNumber={index} style={style}
         //saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         //lookups={props.data.lookups}  setPageMessage={props.setPageMessage} />
//}


export default  function NluSkillsEditor(props) {
    const {loadAll, skillFilterValue, setSkillFilterValue, filteredItems} = useNluEditor('nlutool','examples','alldata', props.updateFunctions.updateLookups)
    const [currentIntent, setCurrentIntent] = useState('')
    const [invocation, setInvocation] = useState('')
    const [entitiesForSkill, setEntitiesForSkill] = useState({})
    const [listsForEntity, setListsForEntity] = useState({})
    const [currentSkill, setCurrentSkill] = useState({id:generateObjectId(), invocation:'', title:skillFilterValue, entities:{}})
    //const skillsManager = useDB('nlutool','skills')
    const listsManager = useDB('nlutool','lists')
    //const [showExportDialog, setShowExportDialog] = useState(false)
    const [collatedItems, setCollatedItems] = useState({})
    const [collatedTags, setCollatedTags] = useState({})
    const [collatedCounts, setCollatedCounts] = useState({})
    const [newSlotValue, setNewSlotValue] = useState('')
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
    function loadSkill() {
        return new Promise(function(resolve,reject) { 
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
                    resolve(skill)
                  });
                //});
            } 
        })
    }
    
    // load all on init
    useEffect(() => {
        loadSkill().then(function() {
        })
        loadAll()
        listsManager.loadAll()
        props.updateFunctions.updateUtterances()
        props.updateFunctions.updateRegexps()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    // load skill on change skillFilterValue
    useEffect(() => {
        loadSkill()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[skillFilterValue])
 
    // load list lookups
    useEffect(() => {
        if (listsManager.items.length > 0) { 
            //console.log(['UPD ITEMS',listsManager.items,listsManager.items[0]])
            props.updateFunctions.updateLists(listsManager.items[0])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[listsManager.items])
    
    // collate entitiesForSkills from filtered example 
    useEffect(() => {
        var entities = {}
        // collate entities from filteredItems
        if (Array.isArray(filteredItems)) {
            filteredItems.map(function (item,itemKey) {
              if (Array.isArray(item.entities)) {
                  item.entities.map(function(entity,entityKey) {
                     if (entity && entity.type && entity.type.length > 0) {
                         if (typeof entities[entity.type] !== "object") entities[entity.type] = {} //
                         //currentSkill.entities && currentSkill.entities[entity.type] ?  currentSkill.entities[entity.type] : {}
                         if (!Array.isArray(entities[entity.type].values )) entities[entity.type].values = []
                         if (currentSkill && currentSkill.entities && currentSkill.entities[entity.type]&& currentSkill.entities[entity.type].alexaType) entities[entity.type].alexaType = currentSkill.entities[entity.type].alexaType
                         if (currentSkill && currentSkill.entities && currentSkill.entities[entity.type]&& currentSkill.entities[entity.type].googleType) entities[entity.type].googleType = currentSkill.entities[entity.type].googleType
                         if (currentSkill && currentSkill.entities && currentSkill.entities[entity.type]&& currentSkill.entities[entity.type].lists) entities[entity.type].lists = currentSkill.entities[entity.type].lists
                         entities[entity.type].values.push(entity.value)
                     }
                     return null
                  })
              }
              return null
            })
        }
        // sort and uniquify
        var slots = currentSkill.slots ? currentSkill.slots : {}
        Object.keys(entities).map(function(entityName,entityKey) {
           const entity = entities[entityName]
           entity.values = uniquifyArray(entity.values).sort()
           
           if (slots[entityName]) {
           } else {
               slots[entityName] = {values:[]}
           }
           return null
        })
        setEntitiesForSkill(entities)
        var updatedSkill = currentSkill
        updatedSkill.entities = entities
        updatedSkill.slots = slots
        
        setCurrentSkill(entities)
        // collate intents and tags from items
         var newCollatedItems = collatedItems
         var newCollatedCounts = collatedCounts
         var newCollatedTags = {}
         if (filteredItems) {
             filteredItems.map(function(item) {
                if (item.intent) {
                    if (!newCollatedItems[item.intent]) newCollatedItems[item.intent]=[]
                    newCollatedCounts[item.intent] =   (newCollatedCounts[item.intent] > 0) ? newCollatedCounts[item.intent] + 1 : 1;
                    //if (collatedItems[item.intent].length < 300) {
                        newCollatedItems[item.intent].push({example: item.example, entities: item.entities})
                    //}
                    
                }
                if (Array.isArray(item.tags)) {
                    item.tags.map(function(tag) {
                        newCollatedTags[tag] = true
                        return null
                    })
                } 
               return null;  
             })
             setCollatedItems(newCollatedItems)
             setCollatedCounts(newCollatedCounts)
             setCollatedTags(newCollatedTags)
             var newSkill = currentSkill;
             if (!newSkill.intents) {
                console.log(['UPDATE INTENTS WITH COLLATED ITEMS',collatedItems])
                 newSkill.intents = collatedItems
            }
             newSkill.tags = Object.keys(collatedTags)
             setCurrentSkill(newSkill)
         }   
    // eslint-disable-next-line react-hooks/exhaustive-deps   
    },[filteredItems])
    
    useEffect(() => {
        
        //console.log(['UDPATE SKILL WITH INTENTS',JSON.parse(JSON.stringify(newSkill))])  
    },[collatedItems,collatedTags])
    
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
        //console.log('change cs or inv',currentSkill)
        var skill = currentSkill
        if (skill && skill.title && skill.title.length > 0) {
            console.log('change cs or inv real')
            
            //var index = skillsManager.findKeyBy('id',newCurrentSkill.id)
            //if (index != null) {
            // merge in entity values
            if (entitiesForSkill) {
                Object.keys(entitiesForSkill).map(function(entity) {
                   if (skill.entities && skill.entities[entity]) {
                       skill.entities[entity].values = entitiesForSkill[entity].values;
                   }  
                   return null
                })
            }
            // merge in intents
            skill.invocation = invocation;
            skill.intents = collatedItems
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

    function forceReload() {
        setListsForEntity(JSON.stringify([currentSkill.rasaSession, currentSkill.rasaEndpoint,currentSkill.rasaCredentials,currentSkill.rasaStories,currentSkill.rasaConfig,currentSkill.rasaActions,currentSkill.rasaExtraSlots,currentSkill.entities,currentSkill.utterances,currentSkill.utterancesLists, currentSkill.slots]))  
    }

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
            forceReload()  
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
          forceReload()  
          //console.log(['REMOVESKILLFROMLIST ddd',lists])
      } 
       //var newEntitiesForSkill = entitiesForSkill
       //if (newEntitiesForSkill[entity]) {
           //var lists = newEntitiesForSkill[entity].lists && Array.isArray(newEntitiesForSkill[entity].lists) ? newEntitiesForSkill[entity].lists : [];
           //newEntitiesForSkill[entity].lists = uniquifyArray([lists.slice(0, listIndex),lists.slice(listIndex + 1)]).sort()
           //setEntitiesForSkill(newEntitiesForSkill)
       //}
    }
  
    function setGoogleAssistantEntityType(entity, type) {
        if (currentSkill && entity) {
            var skill = currentSkill;
            if (!skill.entities) skill.entities={}
            if (!skill.entities[entity]) skill.entities[entity] = {}
            skill.entities[entity].googleType = type
            setCurrentSkill(skill)  
           forceReload()  
       } 
    }
    
    function setAlexaEntityType(entity, type) {
        if (currentSkill && entity) {
            var skill = currentSkill;
            if (!skill.entities) skill.entities={}
            if (!skill.entities[entity]) skill.entities[entity] = {}
            skill.entities[entity].alexaType = type
            setCurrentSkill(skill)  
            console.log('ALEXA')
            console.log(skill)
            forceReload()  
       } 
    }
    
    function setRASASlotType(entity, type, slots) {
        if (currentSkill && entity && type) {
            var skill = currentSkill;
            slots[entity].slotType = type
            skill.slots = slots
            setCurrentSkill(skill)  
            console.log('RASA')
            console.log(skill)
            forceReload()  
       } 
    }
       
    function setRASASlotAutofill(entity, type, slots) {
        
            
        if (currentSkill && entity && type) {
            var skill = currentSkill;
            slots[entity].slotAutofill = type
            skill.slots = slots
            console.log(['RASA autofill',currentSkill ,entity,type, slots])
            setCurrentSkill(skill)  
            console.log(skill)
            forceReload()  
       } 
    }
    
    function newSlot(name,slots) {
        if (name && name.trim().length > 0) {
            if (!slots) slots = {}
            slots[name] = {}
            var skill = currentSkill;
            skill.slots = slots
            setCurrentSkill(skill)  
            setNewSlotValue('')
            console.log('new slot')
            console.log(skill)
            forceReload()  
        }
    }
    
    function deleteSlot(slot, slots) {
        if (currentSkill && slot && slots ) {
            var skill = currentSkill;
            delete slots[slot]
            skill.slots = slots
            setCurrentSkill(skill)  
            console.log('del slot')
            console.log(skill)
            forceReload()  
        }
    }

    function setRASAActions(data) {
          if (currentSkill && data) {
            var skill = currentSkill;
            skill.rasaActions = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    
    function setRASAConfig(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasaConfig = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    
    function setRASAStories(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasaStories = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    function setRASAEndpoint(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasaEndpoint = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    function setRASACredentials(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasaCredentials = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }  
    
    function setRASASession(data) {
       if (currentSkill) {
            var skill = currentSkill;
            skill.rasaSession = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }  
        
    function addRegexp(regexp) {
       
        if (currentSkill && regexp) {
            var skill = currentSkill;
            if (!Array.isArray(skill.regexps)) skill.regexps=[]
            skill.regexps.push(regexp.name)
            skill.regexps = uniquifyArray(skill.regexps)
            setCurrentSkill(skill)  
            //// if this is a new regexp, add it to the main database
            //if (!props.lookups.regexpListsLookups[regexp.name] && !props.lookups.regexpsLookups[regexps.name]) {
                //var regexpStorage = localforage.createInstance({
                   //name: "nlutool",
                   //storeName   : "regexps",
                 //});
                 //regexpStorage.getItem('alldata', function (err,regexps) {
                     //if (err) throw new Error(err)
                     //if (Array.isArray(regexps)) {
                         //regexps.unshift({id:generateObjectId(), value:regexp.name, synonyms:'', tags:[]})
                         //regexpStorage.setItem('alldata',utterances)
                     //}
                 //})
            //}
            forceReload()
       } 
    }
    
    function removeRegexp(index) {
        console.log(['RE UTTERANCE',index])
        if (typeof index === "number" && currentSkill && currentSkill.regexps && currentSkill.regexps.length > index) {
            var skill = currentSkill;
            skill.regexps = [...skill.regexps.slice(0,index),...skill.regexps.slice(index+1)]
            setCurrentSkill(skill)  
            console.log('RASA')
            console.log(skill)
            forceReload()
        }
    }
    
    function setRegexpIntent(index, intent) {
        console.log(['set reg intent',index, intent])
        //if (typeof index === "number" && currentSkill && currentSkill.regexps && currentSkill.regexps.length > index) {
            //var skill = currentSkill;
            //skill.regexps = [...skill.regexps.slice(0,index),...skill.regexps.slice(index+1)]
            //setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            //forceReload()
        //}
    }
    
    function setRegexpEntity(index,entity) {
        console.log(['set reg entity',index, entity])
        //if (typeof index === "number" && currentSkill && currentSkill.regexps && currentSkill.regexps.length > index) {
            //var skill = currentSkill;
            //skill.regexps = [...skill.regexps.slice(0,index),...skill.regexps.slice(index+1)]
            //setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            //forceReload()
        //}
    }
    
    function addUtterance(utterance) {
       
        if (currentSkill && utterance) {
            var skill = currentSkill;
            if (!Array.isArray(skill.utterances)) skill.utterances=[]
            skill.utterances.push(utterance.name)
            skill.utterances = uniquifyArray(skill.utterances)
            setCurrentSkill(skill)  
            console.log('RASA')
            console.log(skill)
            // if this is a new utterance, add it to the main database
            if (!props.lookups.utteranceListsLookups[utterance.name] && !props.lookups.utterancesLookups[utterance.name]) {
                var utteranceStorage = localforage.createInstance({
                   name: "nlutool",
                   storeName   : "utterances",
                 });
                 utteranceStorage.getItem('alldata', function (err,utterances) {
                     if (err) throw new Error(err)
                     if (Array.isArray(utterances)) {
                         utterances.unshift({id:generateObjectId(), value:utterance.name, synonyms:'', tags:[]})
                         utteranceStorage.setItem('alldata',utterances)
                     }
                 })
            }
            forceReload()
       } 
    }
    
    function removeUtterance(index) {
        console.log(['RE UTTERANCE',index])
        if (typeof index === "number" && currentSkill && currentSkill.utterances && currentSkill.utterances.length > index) {
            var skill = currentSkill;
            skill.utterances = [...skill.utterances.slice(0,index),...skill.utterances.slice(index+1)]
            setCurrentSkill(skill)  
            console.log('RASA')
            console.log(skill)
            forceReload()
        }
    }
    function addUtteranceList(utterance) {
          console.log(['ADD UTTERANCE LIST',utterance, currentSkill])
          if (currentSkill && utterance) {
            var skill = currentSkill;
            if (!Array.isArray(skill.utterancesLists)) skill.utterancesLists=[]
            skill.utterancesLists.push(utterance.name)
            skill.utterancesLists = uniquifyArray(skill.utterancesLists)
            setCurrentSkill(skill)  
            console.log('add ut list')
            console.log(skill.utterancesLists)
            forceReload()
       } 
    }
     
    function removeUtteranceList(index) {
        if (typeof index === "number" && currentSkill && currentSkill.utterancesLists) {
            var skill = currentSkill;
            skill.utterancesLists = [...skill.utterancesLists.slice(0,index),...skill.utterancesLists.slice(index+1)]
            setCurrentSkill(skill)  
            console.log('RASA')
            console.log(skill)
            forceReload()
        }
    }    
    
    function renderEditor(props) {
       
        if (skillFilterValue && skillFilterValue.length > 0) {
               
                
            if (filteredItems && filteredItems.length > 0) {
               
                   const utteranceTags = currentSkill && currentSkill.utterances ? currentSkill.utterances.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                   const regexpTags = currentSkill && currentSkill.regexps ? currentSkill.regexps.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                const utteranceListTags = currentSkill && currentSkill.utterancesLists ? currentSkill.utterancesLists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                const slots = currentSkill.slots ? currentSkill.slots : entitiesForSkill;
                return <div>
                     <div><h3>{skillFilterValue} </h3></div>
                        <div>
                       
                        <label style={{fontWeight:'bold', marginLeft:'0.5em'}} > Invocation <input type='text' value={invocation} onChange={function(e) {setInvocation(e.target.value)}} /></label>
                        </div>
                        <div style={{marginTop:'0.7em', marginBottom:'0.7em'}} >
                            <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Tags</b>
                            <span>{currentSkill.tags.join(", ")}</span>
                        </div>
                        <div style={{marginTop:'0.7em', marginBottom:'0.7em', borderTop: '2px solid black'}} >
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
                        </div>
                        <div style={{marginTop:'0.7em', borderTop: '2px solid black'}} >
                      <b style={{marginRight:'1em', marginLeft:'0.5em'}} >Entities</b><ListGroup>{Object.keys(entitiesForSkill).map(function(collatedEntity, i) {
                                
                               
                                const listTags = currentSkill && currentSkill.entities && currentSkill.entities[collatedEntity] && currentSkill.entities[collatedEntity].lists ? currentSkill.entities[collatedEntity].lists.map(function(listItem,listItemKey) {return {id:listItemKey, name:listItem} }) : []
                                //console.log(listTags)
                                    return <ListGroup.Item key={collatedEntity} >
                                            
                                             <span style={{marginLeft:'1em', float:'left', fontWeight:'bold'}}>&nbsp;{collatedEntity}</span>
                                          
                                            <span style={{marginLeft:'1em', float:'left'}}>&nbsp;{entitiesForSkill[collatedEntity] && entitiesForSkill[collatedEntity].values && entitiesForSkill[collatedEntity].values.slice(0,5).join(", ")}{entitiesForSkill[collatedEntity] && entitiesForSkill[collatedEntity].values && entitiesForSkill[collatedEntity].values.length > 5 ? <Badge>... {entitiesForSkill[collatedEntity] && entitiesForSkill[collatedEntity].values && entitiesForSkill[collatedEntity].values.length - 5} more </Badge> : ''}</span>
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
                                            
                                            <div style={{float:'right'}} >
                                                <DropDownComponent options={["",...Alexa.entityTypes]} title="Alexa" value={currentSkill.entities && currentSkill.entities[collatedEntity] && currentSkill.entities[collatedEntity].alexaType ? currentSkill.entities[collatedEntity].alexaType : ''} selectItem={function(entityType) {
                                                    setAlexaEntityType(collatedEntity,entityType)
                                                }} />
                                                &nbsp;&nbsp;<DropDownComponent options={["",...GoogleAssistant.entityTypes]} title="Google" value={currentSkill.entities && currentSkill.entities[collatedEntity] &&  currentSkill.entities[collatedEntity].googleType ? currentSkill.entities[collatedEntity].googleType : ''}  selectItem={function(entityType) {
                                                    setGoogleAssistantEntityType(collatedEntity,entityType)
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
                                tags={regexpTags}
                                tagComponent={function(iprops) {return <TagComponent tag={iprops.tag}  setRegexpEntity={setRegexpEntity} setRegexpIntent={setRegexpIntent} onDelete={function(index) {removeRegexp(index)}} lookups={props.lookups} />}}
                                suggestionComponent={SuggestionComponent}
                                suggestions={props.lookups.regexpsLookups ? props.lookups.regexpsLookups.map(function(tag,i) {return {id: i, name: tag}}):[]}
                                onDelete={function(index) {removeRegexp(index)}}
                                onAddition={function(tag) {addRegexp(tag)}} /></ListGroup>
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
                                onDelete={function(index) {removeUtterance(index)}}
                                onAddition={function(tag) {addUtterance(tag)}} /> </label>
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
                                onDelete={function(index) {removeUtteranceList(index)}}
                                onAddition={function(tag) {addUtteranceList(tag)}} /> </label>
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
                                                 <form onSubmit={function(e) {e.preventDefault(); newSlot(newSlotValue,slots)}} ><input value={newSlotValue} onChange={function(e) {setNewSlotValue(e.target.value)}} /><Button size="sm" onClick={function() {newSlot(newSlotValue,slots)}}>New Slot</Button>
                                                 </form>
                                                  <ListGroup>{Object.keys(slots).map(function(collatedEntity, i) { 
                                                        return <ListGroup.Item key={collatedEntity} >
                                                                        <span style={{marginLeft:'1em', float:'left', fontWeight:'bold'}}>&nbsp;{collatedEntity}</span>
                                                                        <div style={{float:'right'}} >
                                                                             {entitiesForSkill[collatedEntity] &&  <DropDownComponent options={RASA.autofillOptions} title="Autofill" value={currentSkill.slots && currentSkill.entities[collatedEntity] && currentSkill.slots[collatedEntity].slotAutofill && currentSkill.slots[collatedEntity].slotAutofill.trim().length > 0 ? currentSkill.slots[collatedEntity].slotAutofill : 'Yes'} selectItem={function(entityType) {
                                                                                setRASASlotAutofill(collatedEntity,entityType,slots)
                                                                            }} />}
                                                                            &nbsp;&nbsp;
                                                                            <DropDownComponent options={Object.keys(RASA.slotTypes)} title="Slot" value={currentSkill.slots && currentSkill.slots[collatedEntity] && currentSkill.slots[collatedEntity].slotType ? currentSkill.slots[collatedEntity].slotType : 'unfeaturized'} selectItem={function(entityType) {
                                                                                setRASASlotType(collatedEntity,entityType,slots)
                                                                            }} />
                                                                            <Button variant="danger"  size="sm" style={{marginLeft:'0.5em', float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {deleteSlot(collatedEntity,slots)}}>X</Button>
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
                                            <textarea style={{width:'40em', height:'10em'}}  value={Array.isArray(currentSkill.rasaActions) ? currentSkill.rasaActions.join("\n") : ''} onChange={function(e) {setRASAActions(e.target.value ? e.target.value.split("\n") : [])}} placeholder={`fred
    findSname
    is_whatsi
    blah name`} ></textarea>
                                          </label>
                                    </div>
                                      </Tab>
                                       <Tab eventKey="config" title="Config">
                                        <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                          <label>
                                        
                                            <textarea style={{width:'60em', height:'30em'}}  value={currentSkill.rasaConfig ? currentSkill.rasaConfig : ''} onChange={function(e) {setRASAConfig(e.target.value)}} placeholder={RASATemplates.config} ></textarea>
                                          </label>
                                    </div>
                                      </Tab>
                                     <Tab eventKey="stories" title="Stories">
                                        <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                          <label>
                                        
                                            <textarea style={{width:'60em', height:'30em'}}  value={currentSkill.rasaStories ? currentSkill.rasaStories : ''} onChange={function(e) {setRASAStories(e.target.value)}} placeholder={RASATemplates.stories} ></textarea>
                                          </label>
                                    </div>
                                      </Tab> 
                                     <Tab eventKey="credentials" title="Credentials">
                                        <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                          <label>
                                        
                                            <textarea style={{width:'60em', height:'30em'}}  value={currentSkill.rasaCredentials ? currentSkill.rasaCredentials : RASATemplates.credentials} onChange={function(e) {setRASACredentials(e.target.value)}}  ></textarea>
                                          </label>
                                    </div>
                                      </Tab> 
                                                            
                                    <Tab eventKey="endpoints" title="Endpoints">
                                        <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                          <label>
                                        
                                            <textarea style={{width:'60em', height:'30em'}}  value={currentSkill.rasaEndpoint ? currentSkill.rasaEndpoint : RASATemplates.endpoint} onChange={function(e) {setRASAEndpoint(e.target.value)}}  ></textarea>
                                          </label>
                                    </div>
                                      </Tab> 
                                  
                                   <Tab eventKey="session" title="Session Config">
                                        <div style={{marginTop:'0.7em', marginLeft:'1.4em', borderTop: '2px solid black'}} >
                                          <label>
                                        
                                            <textarea style={{width:'60em', height:'30em'}}  value={currentSkill.rasaSession ? currentSkill.rasaSession : RASATemplates.session} onChange={function(e) {setRASASession(e.target.value)}}  ></textarea>
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
                                <b>not yet</b>
                            </div>
                          </Tab>
                          <Tab eventKey="alex" title="Alexa">
                            <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                                <b>not yet</b>
                            </div>
                          </Tab>
                          <Tab eventKey="google_assistant" title="Google Assistant">
                            <div style={{marginTop:'0.7em', marginLeft:'1.4em'}} >
                                <b>not yet</b>
                            </div>
                          </Tab>
                        </Tabs>
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
         {!props.publish && skillFilterValue && skillFilterValue.length > 0 && <Dropdown style={{float:'right',marginLeft:'0.5em'}}  as={ButtonGroup}>
          <Dropdown.Toggle split variant="success"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant="success">Export</Button>
          <Dropdown.Menu variant="success" >
              {exportFormats.map(function(exportFormat,i) {
                  var title = 'opennludata_'+exportFormat.name+'_'+Date.now()
                return <Dropdown.Item variant="success" key={i} value={exportFormat.name} 
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
        </Dropdown>}
        {!props.publish && <Link to={"/skills/skill/"+currentSkill.title+"/publish"} ><Button variant="success" style={{float:'right'}} >Publish</Button></Link>}
         {!props.publish && renderEditor(props)}
         
         {props.publish && <div>
             <Link to={"/skills/skill/"+currentSkill.title} ><Button variant="success" style={{float:'right'}} >Back to Skill</Button></Link>
             <h1>Publish</h1>
             <textarea style={{height: '20em', width:'60em'}}  value={JSON.stringify(currentSkill)}></textarea>
             
        </div>}
         
    </div>
            
}
      
