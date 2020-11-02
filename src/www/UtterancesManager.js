/* global window */
import React, { useEffect} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'

import UtterancesManagerSearchBar from './components/UtterancesManagerSearchBar'
import UtterancesManagerRow from './UtterancesManagerRow'
import useListItemEditor from './useListItemEditor'

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <UtterancesManagerRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups}  lastSelected={props.data.lastSelected} setLastSelected={props.data.setLastSelected} selectBetween={props.data.selectBetween}  />
}

export default  function UtterancesManager(props) {
    const {items, listFilterValue, setListFilterValue, loadAll, deleteItem , findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap,  filteredItems, deleteAll, createEmptyItem, sort, lastSelected, setLastSelected, selectBetween, fromSkill, fromAction, fromForm} = useListItemEditor('nlutool','utterances','alldata', props.updateFunctions.updateUtterances,[], props.updateFunctions.setIsChanged)
    //const [currentList, setCurrentList] = useState('')

    function getItemSize(index) {
        var buttonOffset = 0;
        var size=0;
        var item = items[index]
        if (item && item.buttons && item.buttons.length) {
            buttonOffset = buttonOffset + (item.buttons.length) * 80;
        } else {
            buttonOffset = buttonOffset +50
        }
        if (item && item.images && item.images.length) {
            buttonOffset = buttonOffset + (item.images.length) * 80;
        } else {
            buttonOffset = buttonOffset +50
        }
        if (item && item.texts && item.texts.length) {
            buttonOffset = buttonOffset + (item.texts.length) * 80;
        } else {
            buttonOffset = buttonOffset +50
        }
        if (item && item.audio && item.audio.length) {
            buttonOffset = buttonOffset + (item.audio.length) * 80;
        } else {
            buttonOffset = buttonOffset +50
        }
        if (item && item.video && item.video.length) {
            buttonOffset = buttonOffset + (item.video.length) * 210;
        } else {
            buttonOffset = buttonOffset +50
        }
        if (item && item.frames && item.frames.length) {
            buttonOffset = buttonOffset + (item.frames.length) * 200;
        } else {
            buttonOffset = buttonOffset +50
        }
        //console.log(['UT SIZE',buttonOffset,item])
        if (window.innerWidth < 430) {
               size = 450
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
               size = 220
        } else {
            size = 120
        }
        //console.log(['UT SIZE',buttonOffset,size,item])
        return size + buttonOffset
    }

    useEffect(() => {
        loadAll()
        //props.updateFunctions.updateLists(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
   
    
    function renderEditor(props) {
            if (filteredItems && filteredItems.length > 0) {
            
                return <div>
                    <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length} matches </span>
                     
                     {props.lookups.selectedUtteranceTally > 0 && <span style={{float:'right'}}> 
                        
                        <span>With {props.lookups.selectedUtteranceTally} selected&nbsp;</span>
                        <ListAllDropDown tagAll={tagAll} tagAllValue={tagAllValue} setTagAllValue={setTagAllValue} untagAll={untagAll} lookups={props.lookups}/>
                        <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                    </span>} 
                    
                      <div style={{clear:'both'}}>
                        <div style={{clear:'both'}}>
                            <List
                                key="list"
                                ref={listRef}
                                itemData={{items: filteredItems, saveItem: saveItemWrap, deleteItem, findKeyBy, lookups: props.lookups, lastSelected, setLastSelected, selectBetween}}
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
       
                   
        {<UtterancesManagerSearchBar {...props} fromSkill={fromSkill} fromAction={fromAction} fromForm={fromForm} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort}  />}
         
         
         {renderEditor(props)}
    </div>
            
}
      

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


