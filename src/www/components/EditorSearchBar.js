import React from 'react';
//import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import SearchInput from './SearchInput'
import checkImage from '../images/check.svg'

const EditorSearchBar = function(props) {
    var topskillOptions = props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {props.setSkillFilterValue(skillKey)}}  >{skillKey}</Dropdown.Item>
    })
    topskillOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setSkillFilterValue('')}}  >&nbsp;</Dropdown.Item>)
        
    var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
          return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {props.setIntentFilterValue(intentKey)}}  >{intentKey}</Dropdown.Item>
    })
    intentOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setIntentFilterValue('')}}  >&nbsp;</Dropdown.Item>)
    var tagOptions = props.lookups.tagLookups && props.lookups.tagLookups.sort().map(function(tagKey,i) {
          return <Dropdown.Item key={i} value={tagKey} onClick={function(e) {props.setTagFilterValue(tagKey)}}  >{tagKey}</Dropdown.Item>
    })
    tagOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setTagFilterValue('')}}  >&nbsp;</Dropdown.Item>)
      
    return <div>
            {<span>
            
                {props.lookups.selectedTally > 0 && <Button size="lg"  onClick={function(e) { props.resetSelection(e) }} variant="success"  ><img style={{height:'1em'}} src={checkImage} alt="Deselect" /></Button> }
                {props.lookups.selectedTally <= 0 && <Button size="lg" onClick={function(e) { props.selectAll(e) }} variant="secondary"  ><img style={{height:'1em'}} src={checkImage} alt="Select" /></Button> }
                
                
           </span>}   
            {<span style={{marginLeft:'0.4em'}}><SearchInput searchFilter={props.searchFilter} setSearchFilter={props.setSearchFilter} /></span>}   
            
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'Skill '+(props.skillFilterValue ? ' - '+ props.skillFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {topskillOptions}
                  </Dropdown.Menu>
                </Dropdown>}
                
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'Intent '+(props.intentFilterValue ? ' - '+ props.intentFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {intentOptions}
                  </Dropdown.Menu>
                </Dropdown>}
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'Tag '+(props.tagFilterValue ? ' - '+ props.tagFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {tagOptions}
                  </Dropdown.Menu>
                </Dropdown>}
             <Button  style={{marginLeft:'1em'}} variant="success" onClick={function(e) {props.createEmptyItem(props.skillFilterValue, props.intentFilterValue, props.tagFilterValue)}} >New Intent</Button>
             <Button  style={{marginLeft:'1em'}} variant="primary" onClick={function(e) {props.sort(function(a,b) { if (a.value < b.value) return -1; else return 1;})}} >Sort</Button>
        <hr/>
        </div>
}
export default EditorSearchBar
