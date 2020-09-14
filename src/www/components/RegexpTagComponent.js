//{ tag, removeButtonText, onDelete }
import React from 'react';
import {ListGroup, Button} from 'react-bootstrap'
//import { Link  } from 'react-router-dom'
import DropDownComponent from './DropDownComponent'

export default function RegexpTagComponent(props) {
     let that = this
     //console.log(props.tag)
    // hack to pass functions through
    //const {lookups, setRegexpEntity, setRegexpIntent}  = props
  return (
    <Button type='button'  size="sm" variant='warning' style={{marginLeft:'0.3em', height:'3em'}}  >
       <Button  variant="danger" size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}}  onClick={props.onDelete} >X</Button>
      {props.tag.name}  &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; 
        
    </Button>
  )
}
