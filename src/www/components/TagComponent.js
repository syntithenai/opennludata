//{ tag, removeButtonText, onDelete }
import React from 'react';
import {ListGroup, Button} from 'react-bootstrap'
//import { Link  } from 'react-router-dom'
import DropDownComponent from './DropDownComponent'

export default function TagComponent(props) {
  return (
    <ListGroup.Item type='button'  style={{width:'100%'}} >
       <Button  variant="danger" size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {if (window.confirm('Really delete')) {props.onDelete()}}} >X</Button>
      {props.tag.name} &nbsp;&nbsp;&nbsp; 
        <div style={{float:'right'}}> 
          &nbsp;&nbsp;<DropDownComponent title={'Intent'} value={''} options={props.lookups.intentLookups ? props.lookups.intentLookups : []} selectItem={function(e) {}} />
          &nbsp;&nbsp;<DropDownComponent title={'Entity'} value={''} options={props.lookups.entityLookups ? props.lookups.entityLookups : []} selectItem={function(e) {}} />&nbsp;&nbsp;
        </div>
    </ListGroup.Item>
  )
}
