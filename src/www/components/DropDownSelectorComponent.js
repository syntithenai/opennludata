import React, {useState} from 'react';
import {Button, Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'

const DropDownSelectorComponent = function(props) {
    
    var [selected, setSelected] = useState(props.value ? props.value : '')
    var variant = props.variant ? props.variant : ''
    return <Dropdown variant={variant} as={ButtonGroup}>
          <Dropdown.Toggle  variant={variant}  split  size="sm"   ></Dropdown.Toggle>
          <Button   variant={variant}  size="sm" >{props.value ? props.title + " - " + props.value : props.title} </Button>
          <Dropdown.Menu  variant={variant} >
              {Array.isArray(props.options) && props.options.map(function(optionKey,i) {
                       return <Dropdown.Item  variant={variant}  style={{minHeight:'1.4em'}} key={i} value={optionKey} onClick={function(e) {props.selectItem(optionKey)}}  >
                            {optionKey ? optionKey : <b>None</b>}
                        </Dropdown.Item>
                    //} else return null;
              })}
          </Dropdown.Menu>
      </Dropdown>

}
export default DropDownSelectorComponent
