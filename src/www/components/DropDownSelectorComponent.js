import React, {useState} from 'react';
import {Button, Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'

const DropDownSelectorComponent = function(props) {
    
    var [selected, setSelected] = useState(props.value ? props.value : '')
    
    return <Dropdown  as={ButtonGroup}>
          <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button   size="sm" >{props.value ? props.title + " - " + props.value : props.title} </Button>
          <Dropdown.Menu>
              {Array.isArray(props.options) && props.options.map(function(optionKey,i) {
                       return <Dropdown.Item style={{minHeight:'1.4em'}} key={i} value={optionKey} onClick={function(e) {props.selectItem(optionKey)}}  >
                            {optionKey ? optionKey : <b>None</b>}
                        </Dropdown.Item>
                    //} else return null;
              })}
          </Dropdown.Menu>
      </Dropdown>

}
export default DropDownSelectorComponent
