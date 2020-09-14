//{ tag, removeButtonText, onDelete }
import React from 'react';
import {ListGroup, Button, Badge} from 'react-bootstrap'
//import { Link  } from 'react-router-dom'
import DropDownComponent from './DropDownComponent'

export default function TagComponent(props) {
     let that = this
     ////console.log(props.tag)
    // hack to pass functions through
    //const {lookups, setRegexpEntity, setRegexpIntent}  = props
  return (
    <Button type='button'  size="sm" variant='warning' style={{marginLeft:'0.3em', height:'2.5em'}}  >
       <Badge pill variant="danger" size="lg"  style={{float:'right', fontWeight:'bold', height:'2em', paddingTop:'0.5em'}}  onClick={props.onDelete} >X</Badge>
      {props.tag.name}  &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; 
        
    </Button>
  )
}
