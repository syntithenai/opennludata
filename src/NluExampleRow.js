/* global window */
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom'
import { useHistory } from "react-router-dom";
import {Button, Navbar, ListGroup,  Dropdown, ButtonGroup } from 'react-bootstrap'
import React, {useState, useEffect, memo} from 'react';
import {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileReaderInput from 'react-file-reader-input';
import { FixedSizeList as List } from 'react-window';
import {NavbarComponent, HelpText} from './Components'
import useLocalStorageManager from './useLocalStorageManager'
import {generateObjectId, parentUrl, parseImportText} from './utils'

function NluExampleRow(props) {
        
    console.log(['RENDER NluExampleRow',props])    
        
    const [item, setItem] = useState({})
    // also expose entities to simplify react caching
    const [entities, setEntities] = useState([])
    
    useEffect(() => {
        setItem(props.item ? JSON.parse(JSON.stringify(props.item)) : {})
        setEntities(props.entities ? JSON.parse(JSON.stringify(props.entities)) : [])
    },[])  // only on mount
        
    function createSelection(field, start, end) {
        if (field) {
            //console.log('create selection')
            //console.log(field)
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
        console.log(['USC',content])
        if (item) {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.example = content;
            setItem(newItem)
            //props.saveItem(newItem)
        }
    }
    
    function entityClicked(entityKey,entityType) {
        //if (items && items[splitNumber] && items[splitNumber].entities)  {
            //var entities = props.items[splitNumber].entities
            //var entity = entities[entityKey];
            //if (! props.selectionState || props.selectionState.selection || props.selectionState.selection.length === 0) {
                //// select text in string
                //if (entities[splitNumber] && entities[splitNumber][entityKey]) {
                   //// createSelection(document.getElementById('example_input_'+splitNumber),entities[splitNumber][entity].start,entities[splitNumber][entity].end)
                //}
            //} else {
                entityTypeChanged(entityKey,entityType);
            //}
        //}
    }
    
    function entityTypeChanged(entityNumber,type) {
        //var items = props.items //JSON.parse(JSON.stringify(props.items))
            if (entities) {
                var newEntities = entities
                newEntities[entityNumber].type = type
                setEntities(newEntities)
            }
        
    }
    
    function intentChanged(intent) {
        //var items = props.items //JSON.parse(JSON.stringify(props.items))
            var newItem = item 
            newItem.intent = intent
            setItem(newItem)
            //props.saveItem(newItem)
        //}
    }
 
    
    function entityDelete(entityNumber) {
        if (entities) {
            var newItem = item //itemJSON.parse(JSON.stringify(items[splitNumber]))
            var newEntities = entities.slice(0,entityNumber).concat(entities.slice(entityNumber + 1))
            setEntities(newEntities)
            //saveItem(newItem)
        }
    }
        
        
        
        console.log('RENDER ROW EXAMPLE')
        //return <div >{JSON.stringify(props)}</div>
        let that = this
        var splitNumber = props.splitNumber
        var style = props.style
        //var item = props.item
        console.log(['RR',splitNumber,item])
        const [selectionState, setSelectionState] = useState({})
    
       var intentOptions = props.intentLookups && props.intentLookups.sort().map(function(intentKey,i) {
          return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {intentChanged(intentKey)}}  >{intentKey}</Dropdown.Item>
       })
       // ONE PER ENTITY FOR THIS EXAMPLE
       var entitiesDropdowns = item.entities && item.entities.map(function(entity,i) {
           var entityOptions = props.entityLookups.sort().map(function(entityKey,j) {
              return <Dropdown.Item key={j} value={entityKey} onClick={function(e) {entityTypeChanged(i,entityKey)}}  >{entityKey}</Dropdown.Item>
           })
           return<Dropdown variant='info'  key={i}  as={ButtonGroup}>
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
       if (selectionState  && selectionState.textSelection && selectionState.textSelection.length > 0 &&  selectionState.textSelectionFrom == splitNumber) {
           var entityOptions =  props.entityLookups && props.entityLookups.sort().map(function(entityKey,j) {
              return <Dropdown.Item key={j} value={entityKey} onClick={function(e) {entityTypeChanged(-1,entityKey)}}  >{entityKey}</Dropdown.Item>
           })
           entitiesDropdowns.push(<Dropdown key="new" variant='success'  as={ButtonGroup}>

          <Dropdown.Toggle variant='success'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant='success' size="sm" >New Entity</Button>

          <Dropdown.Menu>
           <form style={{display:'inline'}}>
                <div className="form-group">
                  <input type="text" className="form-control" onChange={function(e) {entityTypeChanged(-1,e.target.value)}}
                value={''   } />
                </div>
              </form>
              {entityOptions}
          </Dropdown.Menu>
        </Dropdown>)
       }
       // onSelect={ function(e) {
                     //var textSelection = window.getSelection().toString(); 
                     //props.setSelectionState({textSelection:textSelection, textSelectionFrom: splitNumber, startTextSelection: e.target.selectionStart, endTextSelection: e.target.selectionEnd})
                  //}} 
       return <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left'}}>
                  
                  <Dropdown   as={ButtonGroup}>
                  <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button   size="sm" >{item.intent ? item.intent.toString() : 'Select Intent'} </Button>
                  <Dropdown.Menu>
                   <form className="px-1 py-1" style={{display:'inline'}}>
                        <div className="form-group">
                          <input type="text" className="form-control" onChange={function(e) {intentChanged(e.target.value)}}
                        value={item.intent ? item.intent : ''} />
                        </div>
                      </form>
                      {intentOptions}
                  </Dropdown.Menu>
                  </Dropdown>
                  <span>{entitiesDropdowns}</span>
                  {item.intent && <Button  style={{float:'right'}}  variant="success" onClicks={function(e) {props.saveNlu(splitNumber)}} >Save</Button>}
                  {!item && <Button   style={{float:'right'}} variant="secondary" >Save</Button>} 
                  <Button  variant="danger" style={{float:'right'}} onClick={function(e) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}} >Delete</Button>
                  
                  <input  type='text' style={{width:'80%'}} value={item.example} id={"example_input_"+splitNumber} onChange={function(e) { updateExampleContent(e.target.value)}} />
                  
                  
                
                
            </div>
      </div>
}
//,function(oldProps,newProps) {
   //console.log(['SHOULD RENDER ROW',oldProps,newProps, JSON.stringify(oldProps.item) == JSON.stringify(newProps.item)])
   //return false //JSON.stringify(oldProps.item) !== JSON.stringify(newProps.item);  
//})
export default memo(NluExampleRow, function(oldProps,newProps) {
    //console.log(['SHOULD UPDATE ROW',oldProps,newProps])    
    return JSON.stringify(oldProps) == JSON.stringify(newProps);  
})
