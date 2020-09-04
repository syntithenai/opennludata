import React, { useEffect} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'

import ListsManagerSearchBar from './components/ListsManagerSearchBar'
import ListsManagerRow from './ListsManagerRow'
import useListItemEditor from './useListItemEditor'

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <ListsManagerRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups} />
}

export default  function ListsManager(props) {
    const {listFilterValue, setListFilterValue, loadAll, deleteItem ,items, findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap, getItemSize,  filteredItems, deleteAll, createEmptyItem, sort} = useListItemEditor('nlutool','lists','alldata', props.updateFunctions.updateLists)
    //const [currentList, setCurrentList] = useState('')

    useEffect(() => {
        loadAll()
        props.updateFunctions.updateLists(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    useEffect(() => {
        //props.updateFunctions.updateLists(filteredItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[filteredItems])
    
    
  
    
    function renderEditor(props) {
                
            if (filteredItems && filteredItems.length > 0) {
                return <div>
                    <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length} matches </span>
                    
                     
                     {props.lookups.selectedListTally > 0 && <span style={{float:'right'}}> 
                        
                        <span>With {props.lookups.selectedListTally} selected&nbsp;</span>
                        <ListAllDropDown tagAll={tagAll} tagAllValue={tagAllValue} setTagAllValue={setTagAllValue} untagAll={untagAll} lookups={props.lookups}/>
                        <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                    </span>} 
                    
                      <div style={{clear:'both'}}>
                        <div style={{clear:'both'}}>
                            <List
                                key="list"
                                ref={listRef}
                                itemData={{items: filteredItems, saveItem: saveItemWrap, deleteItem, findKeyBy, lookups: props.lookups}}
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
   
        {<ListsManagerSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort} />}
         
         {renderEditor(props)}
    </div>
            
}
      
