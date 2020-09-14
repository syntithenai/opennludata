import React, {useState} from 'react';
import {Button, Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'

const DropDownComponent = function(props) {
    
    var [filterValue, setFilterValue] = useState(props.value ? props.value : '')
    
    return <Dropdown  as={ButtonGroup}>
          <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button   size="sm" >{props.value ? props.title + " - " + props.value : props.title} </Button>
          <Dropdown.Menu>
               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; }} >
                <InputGroup>
                  <input type="text" className="form-control" onChange={function(e) {setFilterValue(e.target.value)}}
                value={filterValue} />
                </InputGroup>
                
              </form>
              {Array.isArray(props.options) && props.options.map(function(optionKey,i) {
                  ////console.log([optionKey, filterValue])
                   //if (filterValue.trim().length == 0 || optionKey.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
                       return <Dropdown.Item style={{minHeight:'1.4em'}} key={i} value={optionKey} onClick={function(e) {setFilterValue(optionKey); props.selectItem(optionKey)}}  >
                            {optionKey ? optionKey : <b>None</b>}
                        </Dropdown.Item>
                    //} else return null;
              })}
          </Dropdown.Menu>
      </Dropdown>

}
export default DropDownComponent
