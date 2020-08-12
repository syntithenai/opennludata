import {Button,   Dropdown, ButtonGroup } from 'react-bootstrap'
import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useNluRow from './useNluRow'
export default function NluSkillsRow(props) {
        const  {item, splitNumber , style} = props;
       const {    
            selectionState, newEntity, setNewEntity, 
            entityClicked, entityTypeChanged, entityDelete
        } = useNluRow(props.item, props.saveItem, props.splitNumber, props.style)
            
       //var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
          //return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {intentChanged(intentKey)}}  >{intentKey}</Dropdown.Item>
       //})
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
       //var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                  
                   
                  <Button  variant="primary" style={{float:'right', marginLeft:'1em'}}  onClick={function(e) {}} >Edit</Button>
                  <b style={{marginRight:'1em'}} >{item.example}</b>
                  <span style={{float:'right'}}><div style={{border: '1px solid navyblue', borderRadius:'10px', backgroundColor:'skyblue',padding: '0.3em'}}>Tags &nbsp;
                   {props.lookups.tagLookups.map(function(tag,i) {return <Button style={{marginLeft:'0.5em'}}  key={i} >{tag}</Button>})}
                    </div>
                    </span>
                  
                    
                
            </div>
      </div>
}
