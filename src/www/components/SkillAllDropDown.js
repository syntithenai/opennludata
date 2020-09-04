import React from 'react';
import {Button, Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'

const SkillAllDropDown = function(props) {
    return <Dropdown  as={ButtonGroup}>
          <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button   size="sm" >{'Skill'} </Button>
          <Dropdown.Menu>
           <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; props.skillSetAll(e.target.value)}} >
                <InputGroup>
                  <input type="text" className="form-control" onChange={function(e) {props.setSkillAllValue(e.target.value)}}
                value={props.skillAllValue} />
                <Button variant="success" onClick={function(e) {props.skillSetAll(props.tagAllValue)}} >Add</Button>
                </InputGroup>
                
              </form>
              {props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
              return <Dropdown.Item key={i} value={skillKey}  >
                <Button variant="success" onClick={function(e) {props.setSkillAllValue(skillKey); props.skillSetAll(skillKey)}} >Add to {skillKey}</Button>
                <Button variant="danger" onClick={function(e) { props.unskillAll(skillKey)}} style={{marginLeft: '0.5em'}}>Remove</Button></Dropdown.Item>
    })}
          </Dropdown.Menu>
      </Dropdown>
      
      
    
    //return <Dropdown  as={ButtonGroup}>
          //<Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          //<Button   size="sm" >{'Skill'} </Button>
          //<Dropdown.Menu>
           //<form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; props.skillSetAll(e.target.value)}} >
                //<div className="form-group">
                  //<input type="text" className="form-control" onChange={function(e) {props.setSkillAllValue(e.target.value)}}
                //value={props.skillAllValue} />
                //</div>
              //</form>
              //{props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
              //return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {props.setSkillAllValue(skillKey); props.skillSetAll(skillKey)}}  >{skillKey}</Dropdown.Item>
    //})}
          //</Dropdown.Menu>
      //</Dropdown>
}
export default SkillAllDropDown
