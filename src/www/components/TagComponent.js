//{ tag, removeButtonText, onDelete }
import React from 'react';
import {ListGroup, Button} from 'react-bootstrap'
//import { Link  } from 'react-router-dom'
import DropDownComponent from './DropDownComponent'

export default function TagComponent(props) {
     let that = this
     console.log(props.tag)
    // hack to pass functions through
    const {lookups, setRegexpEntity, setRegexpIntent}  = props
  return (
    <ListGroup.Item type='button'  style={{width:'100%'}} >
       <Button  variant="danger" size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}}  onClick={function(e) {if (window.confirm('Really delete')) {props.onDelete(e)}}} >X</Button>
      {props.tag.name}  &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; 
        <div style={{float:'right'}}> 
          &nbsp;&nbsp;<DropDownComponent title={'Intent'} value={props.tag && props.tag.intent ? props.tag.intent :''} options={lookups && lookups.intentLookups ? lookups.intentLookups : []} selectItem={function(e) {setRegexpIntent(props.tag.id,e)}} />
          &nbsp;&nbsp;<DropDownComponent title={'Entity'} value={props.tag && props.tag.entity ? props.tag.entity :''} options={lookups && lookups.entityLookups ? lookups.entityLookups : []} selectItem={function(e) {setRegexpEntity(props.tag.id,e)}} />&nbsp;&nbsp;
        </div>
    </ListGroup.Item>
  )
}
