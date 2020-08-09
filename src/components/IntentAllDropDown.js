import React from 'react';
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'

const IntentAllDropDown = function(props) {
    return  <Dropdown  as={ButtonGroup}>
              <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
              <Button   size="sm" >{'Intent'} </Button>
              <Dropdown.Menu>
               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; props.intentAll(e.target.value)}} >
                    <div className="form-group">
                      <input type="text" className="form-control" onChange={function(e) {props.setIntentAllValue(e.target.value)}}
                    value={props.intentAllValue} />
                    </div>
                  </form>
                  {props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
                      return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {props.setIntentAllValue(intentKey); props.intentAll(intentKey)}}  >{intentKey}</Dropdown.Item>
                   })}
              </Dropdown.Menu>
          </Dropdown>
}
export default IntentAllDropDown
