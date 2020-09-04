import React from 'react';
import {Button, Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'

const ListAllDropDown = function(props) {
    return <Dropdown  as={ButtonGroup}>
          <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button   size="sm" >{'Set List'} </Button>
          <Dropdown.Menu>
           <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; props.tagAll(e.target.value)}} >
                <InputGroup>
                  <input type="text" className="form-control" onChange={function(e) {props.setTagAllValue(e.target.value)}}
                value={props.tagAllValue} />
                <Button variant="success" onClick={function(e) {props.tagAll(props.tagAllValue)}} >Add</Button>
                </InputGroup>
                
              </form>
              {props.lookups.listsLookups && props.lookups.listsLookups.sort().map(function(skillKey,i) {
              return <Dropdown.Item key={i} value={skillKey}  >
                <Button variant="success" onClick={function(e) {props.setTagAllValue(skillKey); props.tagAll(skillKey)}} >Add to {skillKey}</Button>
                <Button variant="danger" onClick={function(e) { props.untagAll(skillKey)}} style={{marginLeft: '0.5em'}}>Remove</Button></Dropdown.Item>
    })}
          </Dropdown.Menu>
      </Dropdown>
}
export default ListAllDropDown
