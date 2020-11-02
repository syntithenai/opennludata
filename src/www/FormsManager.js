/* global window */
import React, { useEffect} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'
import {generateObjectId} from './utils'
import FormsManagerSearchBar from './components/FormsManagerSearchBar'
import FormsManagerRow from './FormsManagerRow'
import useListItemEditor from './useListItemEditor'

var initData = [
  ]

initData = initData.map(function(item) {
  return Object.assign(item,{id:generateObjectId()})  
})

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <FormsManagerRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups} updateFunctions={props.data.updateFunctions} lastSelected={props.data.lastSelected} setLastSelected={props.data.setLastSelected} selectBetween={props.data.selectBetween} fromSkill={props.data.fromSkill} />
}

export default  function FormsManager(props) {
    const {items, listFilterValue, setListFilterValue, loadAll, deleteItem , findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap,  filteredItems, deleteAll, createEmptyItem, sort, lastSelected, setLastSelected, selectBetween, fromSkill} = useListItemEditor('nlutool','forms','alldata', props.updateFunctions.updateForms, initData, props.updateFunctions.setIsChanged)
    //const [currentList, setCurrentList] = useState('')

    function getItemSize(index) {
        //console.log('action seiz',items,filteredItems)
        var item = items[index]
        var baseSize = 0
        if (window.innerWidth < 430) {
               baseSize =  520
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
               baseSize = 3435
        } else {
            baseSize = 305
        }
        var numResponses = item.responses ? item.responses.length : 0
        var numApis = item.apis ? item.apis.length : 0
        //console.log('action seiz',item.apis,item.responses, index, item,baseSize,numResponses)
        return baseSize + numResponses * 70 + numApis * 70
    }
    
    
    useEffect(() => {
        props.updateFunctions.updateUtterances()
        props.updateFunctions.updateApis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    useEffect(() => {
        loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
   
    function renderEditor(props) {
            if (filteredItems && filteredItems.length > 0) {
            
                return <div>
                    <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length} matches </span>
                     {props.lookups.selectedActionTally > 0 && <span style={{float:'right'}}> 
                        <span>With {props.lookups.selectedFormTally} selected&nbsp;</span>
                        
                        
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
                                  {props.lookups.formTagsLookups && props.lookups.formTagsLookups.sort().map(function(skillKey,i) {
                                  return <Dropdown.Item key={i} value={skillKey}  >
                                    <Button variant="success" onClick={function(e) {setTagAllValue(skillKey); tagAll(skillKey)}} >Add to {skillKey}</Button>
                                    <Button variant="danger" onClick={function(e) { untagAll(skillKey)}} style={{marginLeft: '0.5em'}}>Remove</Button></Dropdown.Item>
                                })}
                              </Dropdown.Menu>
                          </Dropdown>
                          
                    
                        
                        <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                    </span>} 
                    
                      <div style={{clear:'both'}}>
                        <div style={{clear:'both'}}>
                            <List
                                key="list"
                                ref={listRef}
                                itemData={{items: filteredItems, saveItem: saveItemWrap, deleteItem, findKeyBy, lookups: props.lookups, lastSelected, setLastSelected, selectBetween, updateFunctions: props.updateFunctions, fromSkill: fromSkill}}
                                itemKey={index => index}  
                                className="List"
                                height={700}
                                itemCount={filteredItems.length}
                                itemSize={getItemSize}
                                width={'100%'}
                              >{RenderRow}
                            </List>
                        </div>
                    </div>
               </div>

            }
              
    }
    
  
    return <div>
        
                   
        {<FormsManagerSearchBar {...props} fromSkill={fromSkill} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort} />}
         
         
         {renderEditor(props)}
    </div>
            
}
      

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


