/* global window */
import {Button,   Dropdown, ButtonGroup } from 'react-bootstrap'
import React, {useState, useEffect} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTags from 'react-tag-autocomplete'

export default function NluSkillsRow(props) {
    const [selectionState, setSelectionState] = useState({})
    const {item, splitNumber, style} = props;
    const [newEntity, setNewEntity] = useState('')
    // for ReactTags format using objects
     const [tags, setTags] = useState([])
    const [skills, setSkills] = useState([])
    const reactTags = React.createRef()
    const reactSkills = React.createRef()
    // tags
    // tags
    useEffect(() => {
        if (item.tags) setTags(item.tags.map(function(tag,i) {return {id:i, name:tag}}))
        if (item.skills) setSkills(item.skills.map(function(skill,i) {return {id:i, name:skill}}))
    },[item])
    
     function onTagDelete (i) {
         console.log('ondel',i)
        const newTags = tags.slice(0)
        newTags.splice(i, 1)
        setTags(newTags)
        var newItem = item
        newItem.tags = newTags.map(function(newTag) { return newTag.name})
        props.saveItem(newItem,props.splitNumber)
      }
     
     function onTagAddition (tag) {
        console.log('onadd',tag)
        const newTags = [].concat(tags, tag)
        setTags(newTags)
        var newItem = item
        newItem.tags = newTags.map(function(newTag) { return newTag.name})
        props.saveItem(newItem,props.splitNumber)
      }
      
      function onSkillDelete (i) {
         console.log('ondel',i)
        const newSkills = skills.slice(0)
        newSkills.splice(i, 1)
        setSkills(newSkills)
        var newItem = item
        newItem.skills = newSkills.map(function(newSkill) { return newSkill.name})
        props.saveItem(newItem,props.splitNumber)
      }
     
     function onSkillAddition (skill) {
        console.log('onadd',skill)
        const newSkills = [].concat(skills, skill)
        setSkills(newSkills)
        var newItem = item
        newItem.skills = newSkills.map(function(newSkill) { return newSkill.name})
        props.saveItem(newItem,props.splitNumber)
      }
        
    function createSelection(field, start, end) {
        if (field) {
            if( field.createTextRange ) {
                var selRange = field.createTextRange();
                selRange.collapse(true);
                selRange.moveStart('character', start);
                selRange.moveEnd('character', end-start);
                selRange.select();
            } else if( field.setSelectionRange ) {
                field.setSelectionRange(start, end);
            } else if( field.selectionStart ) {
                field.selectionStart = start;
                field.selectionEnd = end;
            }
            field.focus();
        }
    }
    
    function updateExampleContent(content) {
        if (item) {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.example = content;
            props.saveItem(newItem,props.splitNumber)
        }
    }
    
    function entityClicked(entityKey,entityType) {
        if (item.entities)  {
            var entities = item.entities
            if (! selectionState || !selectionState.textSelection || selectionState.textSelection.length === 0) {
                // select text in string
                if (entities[entityKey]) {
                   createSelection(document.getElementById('example_input_'+splitNumber),entities[entityKey].start,entities[entityKey].end)
                }
            } else {
                entityTypeChanged(entityKey,entityType);
            }
        }
    }
    
    function entityTypeChanged(entityNumber,type) {
        var newItem = item
        if (item.entities) {
            var newEntities = item.entities ? item.entities : []
            var entity = newEntities[entityNumber] ? newEntities[entityNumber] : {}
            entity.type = type
            if (selectionState && selectionState.textSelection) {
                entity.value = selectionState.textSelection
                entity.start = selectionState.startTextSelection
                entity.end = selectionState.endTextSelection
            }
            if (!newEntities[entityNumber]) newEntities.push(entity)
            else newEntities[entityNumber] = entity
            
            newItem.entities = newEntities
            setSelectionState(null)
            props.saveItem(newItem,props.splitNumber)
        }
        
    }
    
    function intentChanged(intent) {
        var newItem = item 
        newItem.intent = intent
        props.saveItem(newItem,props.splitNumber)
    }
 
    
    function entityDelete(entityNumber) {
        if (item.entities) {
            var newItem = item 
            var newEntities = item.entities.slice(0,entityNumber).concat(item.entities.slice(entityNumber + 1))
            newItem.entities = newEntities
            props.saveItem(newItem,props.splitNumber)
        }
    }
    
    function selectItem(splitNumber) {
        var newItem = item
        item.isSelected = true;
        props.saveItem(newItem,props.splitNumber)
    }
    
    function deselectItem(splitNumber) {
        var newItem = item
        item.isSelected = false;
        props.saveItem(newItem,props.splitNumber)
    }      
       var intentOptions = props.intentLookups && props.intentLookups.sort().map(function(intentKey,i) {
          return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {intentChanged(intentKey)}}  >{intentKey}</Dropdown.Item>
       })
       // ONE PER ENTITY FOR THIS EXAMPLE
       var entitiesDropdowns = item && item.entities && item.entities.map(function(entity,i) {
           var entityOptions = props.lookups.entityLookups.sort().map(function(entityKey,j) {
              return <Dropdown.Item  key={j} value={entityKey} onClick={function(e) {entityTypeChanged(i,entityKey)}}  >{entityKey}</Dropdown.Item>
           })
           return<Dropdown style={{marginLeft:'0.2em'}} variant='info'  key={i}  as={ButtonGroup}>
              <Dropdown.Toggle variant='info'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
              <Button variant='info'   size="sm"  onClick={function(e) {entityClicked(i,entity.type)}} >
              <b>{entity.type}</b> 
                -
              {entity.value ? entity.value : 'Select Entity Type'}
              </Button>
              <Button variant="info" size="sm" onClick={function(e) {entityDelete(i,'')}} >X</Button>
              <Dropdown.Menu>
                  <form  style={{display:'inline'}}>
                    <div className="form-group">
                      <input type="text" className="form-control" onChange={function(e) {entityTypeChanged(i,e.target.value)}}
                    value={entity.type} />
                    </div>
                  </form>
                  {entityOptions}
              </Dropdown.Menu>
            </Dropdown>
       }) ;
        //PLUS CREATE NEW WHEN TEXT IS SELECTED
       if (selectionState  && selectionState.textSelection && selectionState.textSelection.length > 0 &&  selectionState.textSelectionFrom === splitNumber) {
           var entityOptions =  props.lookups.entityLookups && props.lookups.entityLookups.sort().map(function(entityKey,j) {
              return <Dropdown.Item key={j} value={entityKey} onClick={function(e) {entityTypeChanged(-1,entityKey)}}  >{entityKey}</Dropdown.Item>
           })
           entitiesDropdowns.push(<Dropdown key="new" variant='success'  as={ButtonGroup}>

          <Dropdown.Toggle variant='success'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant='success' size="sm" >New Entity</Button>

          <Dropdown.Menu>
           <form style={{display:'inline'}} onSubmit={function(e) {e.preventDefault(); entityTypeChanged(-1,newEntity)}}>
                <div className="form-group">
                  <input type="text" className="form-control" onChange={function(e) {setNewEntity(e.target.value)}}
                value={newEntity} />
                </div>
              </form>
              {entityOptions}
          </Dropdown.Menu>
        </Dropdown>)
       }
       var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                  
                   {!item.isSelected && <Button style={{float: 'left'}} size="lg" variant="secondary" onClick={function() {selectItem(splitNumber)}} ><img src='/check.svg' /></Button>}
                  {item.isSelected && <Button style={{float: 'left'}} size="lg" variant="success" onClick={function() {deselectItem(splitNumber)}} ><img src='/check.svg' /></Button>}
                  
                  {item.intent && <Button  style={{float:'right', marginLeft:'0.2em'}}  variant="success"  onClick={function() {props.saveNlu(splitNumber)}} ><img src="/thumb-up.svg" alt="Save" /> Save</Button>}
                  {!item && <Button   style={{float:'right', marginLeft:'0.2em'}} variant="secondary" ><img src="/thumb-up.svg" alt="Save" /> Save</Button>} 
                  <Button  variant="danger" style={{float:'right'}} onClick={function(e) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}} ><img src="/thumb-down.svg" alt="Delete" /> Delete</Button>
                  
                 
                  <Dropdown  style={{float:'left'}} as={ButtonGroup}>
                  <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button   size="sm" >{item.intent ? item.intent.toString() : 'Select Intent'} </Button>
                  <Dropdown.Menu>
                   <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault()}}>
                        <div className="form-group">
                          <input type="text" className="form-control" onChange={function(e) {intentChanged(e.target.value)}}
                        value={item.intent ? item.intent : ''} />
                        </div>
                      </form>
                      {intentOptions}
                  </Dropdown.Menu>
                  </Dropdown>
                  <span style={{float:'left'}}>{entitiesDropdowns}</span>
                 
                  <div style={{float:'left'}}>
                   <ReactTags
                    placeholderText="Add to skill"
                    autoresize={false}
                    allowNew={true}
                    ref={reactSkills}
                    tags={skills}
                    suggestions={props.lookups.skillLookups.map(function(tag,i) {return {id: i, name: tag}})}
                    onDelete={onSkillDelete}
                    onAddition={onSkillAddition} /> 
                    </div>
                    
                  <div style={{float:'left'}}>
                   <ReactTags
                    placeholderText="Add new tag"
                    autoresize={false}
                    allowNew={true}
                    ref={reactTags}
                    tags={tags}
                    suggestions={props.lookups.tagLookups.map(function(tag,i) {return {id: i, name: tag}})}
                    onDelete={onTagDelete}
                    onAddition={onTagAddition} /> 
                    </div>
                  
                  <input     
                   onFocus={ function(e) {
                       setSelectionState(null)
                    }}
                   onSelect={ function(e) {
                     var textSelection = window.getSelection().toString(); 
                     setSelectionState({textSelection:textSelection, textSelectionFrom: splitNumber, startTextSelection: e.target.selectionStart, endTextSelection: e.target.selectionEnd})
                  }}  
                   type='text' style={{width:'80%'}} value={item.example} id={"example_input_"+splitNumber} onChange={function(e) { updateExampleContent(e.target.value)}} />
                  
                  
                
                
            </div>
      </div>
}
