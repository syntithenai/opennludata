import React, {useState} from 'react';
import {Button, Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'

const ImportListsDropDown = function(props) {
    //console.log(props)
    const [importToValue,setImportToValue] = useState(props.importTo ? props.importTo : '')
    return <Dropdown style={{float:'right', marginLeft:'0.5em'}} variant="success"  as={ButtonGroup}>
          <Dropdown.Toggle split  size="md" variant="success"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button variant="success"  size="md" >{'Import Entities as'} </Button>
          <Dropdown.Menu>
           <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; props.importListTo(importToValue)}} >
                <div className="form-group">
                <InputGroup> 
                    <input type="text" className="form-control" onChange={function(e) {setImportToValue(e.target.value)}}
                value={importToValue} />
                    <Button size="sm"  onClick={function(e) {props.importListTo(importToValue)}} >Import</Button>
                </InputGroup>
                </div>
              </form>
              {props && props.lookups && props.lookups.listsLookups && props.lookups.listsLookups.sort().map(function(skillKey,i) {
              return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setImportToValue(skillKey); props.importListTo(skillKey)}}  >{skillKey}</Dropdown.Item>
    })}
          </Dropdown.Menu>
      </Dropdown>
}
export default ImportListsDropDown
