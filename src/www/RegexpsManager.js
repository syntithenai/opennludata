/* global window */
import React, { useEffect} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'

import RegexpsManagerSearchBar from './components/RegexpsManagerSearchBar'
import RegexpsManagerRow from './RegexpsManagerRow'
import useListItemEditor from './useListItemEditor'

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <RegexpsManagerRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups} />
}

export default  function RegexpsManager(props) {
    const {listFilterValue, setListFilterValue, loadAll, deleteItem , findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap,  filteredItems, deleteAll, createEmptyItem, sort} = useListItemEditor('nlutool','regexps','alldata', props.updateFunctions.updateRegexps)
    //const [currentList, setCurrentList] = useState('')

    function getItemSize() {
        if (window.innerWidth < 430) {
               return 260
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
               return 185
        } else {
            return 150
        }
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
                     
                     {props.lookups.selectedRegexTally > 0 && <span style={{float:'right'}}> 
                        <span>With {props.lookups.selectedRegexTally} selected&nbsp;</span>
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
        
                   
        {<RegexpsManagerSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort} />}
         
         
         {renderEditor(props)}
    </div>
            
}
      

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


