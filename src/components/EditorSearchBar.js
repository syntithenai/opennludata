import React from 'react';
//import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import SearchInput from './SearchInput'

const EditorSearchBar = function(props) {
    var topskillOptions = props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {props.setSkillFilterValue(skillKey)}}  >{skillKey}</Dropdown.Item>
    })
    topskillOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setSkillFilterValue('')}}  >&nbsp;</Dropdown.Item>)
        
    var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
          return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {props.setIntentFilterValue(intentKey)}}  >{intentKey}</Dropdown.Item>
    })
    intentOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setIntentFilterValue('')}}  >&nbsp;</Dropdown.Item>)
        
    return <div>
            {<span>
            
                {props.lookups.selectedTally > 0 && <Button size="lg"  onClick={function(e) { props.resetSelection(e) }} variant="success"  ><img style={{height:'1em'}} src='/check.svg' alt="Deselect" /></Button> }
                {props.lookups.selectedTally <= 0 && <Button size="lg" onClick={function(e) { props.selectAll(e) }} variant="secondary"  ><img style={{height:'1em'}} src='/check.svg' alt="Select" /></Button> }
                
                
           </span>}   
            {<span style={{marginLeft:'0.4em'}}><SearchInput searchFilter={props.searchFilter} setSearchFilter={props.setSearchFilter} /></span>}   
            
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'Intent '+(props.intentFilterValue ? ' - '+ props.intentFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {intentOptions}
                  </Dropdown.Menu>
                </Dropdown>}
            
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'Skill '+(props.skillFilterValue ? ' - '+ props.skillFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {topskillOptions}
                  </Dropdown.Menu>
                </Dropdown>}
             <Button  style={{marginLeft:'1em'}} variant="success" onClick={function(e) {props.createEmptyItem(props.skillFilterValue, props.intentFilterValue)}} >New Intent</Button>
        </div>
}
export default EditorSearchBar
