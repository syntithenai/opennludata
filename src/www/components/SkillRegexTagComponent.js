//{ tag, removeButtonText, onDelete }
import React from 'react';
import {ListGroup, Button} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import DropDownComponent from './DropDownComponent'

export default function SkillRegexTagComponent(props) {
     let that = this
     //console.log(props.tag)
    // hack to pass functions through
    const {lookups, setRegexpEntity, setRegexpIntent}  = props
  return (
    <span>
       {props.tag.name} 
       &nbsp;&nbsp;
       <Link to={'/regexps/filter/'+props.tag.name+'/fromskill/'+props.skillFilterValue}><Button  variant="primary"  >Edit</Button></Link>
       
       <Button  variant="danger"   onClick={function(e) {if (window.confirm('Really delete')) {props.onDelete(e)}}} >Delete</Button>
        &nbsp;&nbsp;&nbsp;
    </span>
  )
}
