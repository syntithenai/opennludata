/* global window */
import React, { useEffect, useState} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Tabs, Tab, Button, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'
import {generateObjectId} from './utils'
import ActionsManagerSearchBar from './components/ActionsManagerSearchBar'
import ActionsManagerRow from './ActionsManagerRow'
import useListItemEditor from './useListItemEditor'

var initData = [
  ]

initData = initData.map(function(item) {
  return Object.assign(item,{id:generateObjectId()})  
})

//const RenderRow = function(props) {
    //const index = props.index
    //const style = props.style
    //const item = props.data.items[index]
    //return <ActionsManagerRow  
         //item={item}  splitNumber={index} style={style}
         //saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         //lookups={props.data.lookups} updateFunctions={props.data.updateFunctions} lastSelected={props.data.lastSelected} setLastSelected={props.data.setLastSelected} selectBetween={props.data.selectBetween} fromSkill={props.data.fromSkill} />
//}

export default  function ActionsManager(props) {
    const {items, listFilterValue, setListFilterValue, loadAll, deleteItem , findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap,  filteredItems, deleteAll, createEmptyItem, sort, lastSelected, setLastSelected, selectBetween, fromSkill, fromForm} = useListItemEditor('nlutool','actions','alldata', props.updateFunctions.updateActions, initData, props.updateFunctions.setIsChanged)
    //const [currentList, setCurrentList] = useState('')


    const [apiFunctions, setApiFunctions] = useState({}) 
    const [codeError, setCodeError] = useState(null)
    var apiFunctionUpdateTimeout = null
    
    useEffect(() => {
        loadAll()
        props.updateFunctions.updateUtterances()
        updateApiFunctionsLookups()
    },[]) 
    
    function updateApiFunctionsLookups() {
        props.updateFunctions.updateApis().then(function(apisCompleteLookups) {
        
        //console.log(['APIBUTTON',button,props.lookups.apisCompleteLookups])
            // instantiate api to discover available functions
            var apiInstance = null
            var newApiFunctions = apiFunctions
            //console.log(['CALLAPI LOOKUP',apisCompleteLookups,window])
            apisCompleteLookups.map(function(apiComplete) {
              //if (apiComplete.value === button.text) {
                try {
                    apiInstance = new Function('intent','history','slots','config','utils','window','slot','response','api','reset','restart','back','listen','nolisten','form',apiComplete && apiComplete.synonym && apiComplete.synonym.trim ? apiComplete.synonym.trim() : '')
                    if (typeof apiInstance === 'function') {
                        //apiFunctions = apiInstance([],{},{}) 
                        newApiFunctions[apiComplete.value] = Object.keys(apiInstance({},[],{},{},{}, window,{},{},{},function(){},function(){},function(){},function(){},function(){},function(){}) )
                    }
                } catch (e) {
                    console.log(e)
                    setCodeError(e.toString())
                
                }

              //}  
            } )
            setApiFunctions(newApiFunctions)
        })
    }
    

    function getItemSize(index) {
        //console.log('action seiz',items,filteredItems)
        var item = items[index]
        var baseSize = 0
        if (window.innerWidth < 430) {
               baseSize =  620
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
               baseSize = 515
        } else {
            baseSize = 505
        }
        var numResponses = item.responses ? item.responses.length : 0
        var numApis = item.apis ? item.apis.length : 0
        var numForms = item.forms ? item.forms.length : 0
        
        //console.log('action seiz',item.apis,item.responses, index, item,baseSize,numResponses)
        return baseSize + numResponses * 70 + numApis * 70 + numForms * 70
    }
    
    function renderEditor(props) {
            if (filteredItems && filteredItems.length > 0) {
            
                return <div>
                    <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length} matches </span>
                     {props.lookups.selectedActionTally > 0 && <span style={{float:'right'}}> 
                        <span>With {props.lookups.selectedActionTally} selected&nbsp;</span>
                        
                        
                        <Dropdown  as={ButtonGroup}>
                              <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
                              <Button   size="sm" >{'Set Tag'} </Button>
                              <Dropdown.Menu>
                               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; tagAll(e.target.value)}} >
                                    <InputGroup>
                                      <input type="text" className="form-control" onChange={function(e) {setTagAllValue(e.target.value)}}
                                    value={tagAllValue} />
                                    <Button variant="success" onClick={function(e) {tagAll(tagAllValue)}} >Add</Button>
                                    </InputGroup>
                                    
                                  </form>
                                  {props.lookups.actionTagsLookups && props.lookups.actionTagsLookups.sort().map(function(skillKey,i) {
                                  return <Dropdown.Item key={i} value={skillKey}  >
                                    <Button variant="success" onClick={function(e) {setTagAllValue(skillKey); tagAll(skillKey)}} >Add to {skillKey}</Button>
                                    <Button variant="danger" onClick={function(e) { untagAll(skillKey)}} style={{marginLeft: '0.5em'}}>Remove</Button></Dropdown.Item>
                                })}
                              </Dropdown.Menu>
                          </Dropdown>
                          
                    
                        
                        <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                    </span>} 
                    
                      <div style={{clear:'both'}}>
                        <Tabs  defaultActiveKey="0" id="apistabs">
                            {Array.isArray(filteredItems) && filteredItems.map(function(item,key) {
                                return <Tab key={key} eventKey={key} title={item.value}>
                                <ActionsManagerRow  
                                 item={item}  splitNumber={key} style={{}}
                                 saveItem={saveItemWrap} deleteItem={deleteItem} apiFunctions={apiFunctions} codeError={codeError}
                                 lookups={props.lookups} updateFunctions={props.updateFunctions}  lastSelected={lastSelected} setLastSelected={setLastSelected} selectBetween={selectBetween}  />
                                 
                                </Tab>
                            })}
                        </Tabs>
                        
                    </div>
               </div>

            }
              
    }
    
  
    return <div>
        
                   
        {<ActionsManagerSearchBar {...props} fromSkill={fromSkill}  fromForm={fromForm} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort} />}
         
         
         {renderEditor(props)}
    </div>
            
}
      

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


