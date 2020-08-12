import React, { useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
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
    const {loadAll, deleteItem ,items, findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap, getItemSize,  filteredItems, listFilterValue, setListFilterValue, deleteAll, createEmptyItem} = useListItemEditor('nlutool','lists','alldata', props.updateLists)
    //const [currentList, setCurrentList] = useState('')
   
    useEffect(() => {
        loadAll()
        props.updateLists(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    //useEffect(() => {
        //if (importFrom) {
            //var parsed = parseImportText(importFrom)
            //setItems(parsed)
            //props.setImportFrom('')
        //}
    //// eslint-disable-next-line react-hooks/exhaustive-deps
    //},[props.importFrom])
    
    
  
    
    function renderEditor(props) {
       
        //if (listFilterValue && listFilterValue.length > 0) {
            
            // filter rendered list using callback 
            //var filteredItems = filter(function(item) {
                //if (!searchFilter || searchFilter.length <=0 ) return true;
                //const matchSearchFilter = item.example.indexOf(searchFilter) !== -1 
                        //|| item.intent.indexOf(searchFilter) !== -1 
                        //|| (item.tags && item.tags.indexOf(searchFilter) !== -1)
                //return matchSearchFilter && skillFilterValue && item.skills && item.skills.indexOf(skillFilterValue) !== -1
                
            //})
             //var collatedItems={}
             //var collatedCounts={}
             //if (filteredItems) {
                 //filteredItems.map(function(item) {
                    //if (item.value) {
                        //if (!collatedItems[item.value]) collatedItems[item.value]=[]
                        //collatedCounts[item.value] =   (collatedCounts[item.value] > 0) ? collatedCounts[item.value] + 1 : 1;
                        ////if (collatedItems[item.intent].length < 300) {
                            //collatedItems[item.value].push(item)
                        ////}
                        
                    //}
                   //return null;  
                 //})
             //}   
                
                
            if (filteredItems && filteredItems.length > 0) {
               
               //var tagOptions = props.lookups.tagLookups && props.lookups.tagLookups.sort().map(function(tagKey,i) {
                  //return <Dropdown.Item key={i} value={tagKey} onClick={function(e) {setTagAllValue(tagKey); tagAll(tagKey)}}  >{tagKey}</Dropdown.Item>
               //})
               //var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
                  //return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {setIntentAllValue(intentKey);intentAll(intentKey)}}  >{intentKey}</Dropdown.Item>
               //})
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
                 //<span>{Object.keys(collatedItems).map(function(collatedList, i) {
                                //var useCurrentList = currentList ? currentList : Object.keys(collatedItems)[0]
                                
                                ////const warning = <b>{collatedItems[collatedIntent].length}/{collatedCounts[collatedIntent].length}</b>
                                ////collatedItems[collatedIntent].length  === collatedCounts[collatedIntent].length ? <b>/dd{collatedCounts[collatedIntent].length}</b> : <b>/{collatedCounts[collatedIntent].length}</b>
                                //var completionVariant = 'danger'
                                //if (collatedItems[collatedList].length > 300) {
                                    //completionVariant = 'success'
                                //} else if (collatedItems[collatedList].length > 100) {
                                    //completionVariant = 'primary'
                                //} else if (collatedItems[collatedList].length > 10) {
                                    //completionVariant = 'warning'
                                //} 
                                
                                
                                //if (collatedItems[collatedList].length  === collatedCounts[collatedList]) {
                                        //return <Button key={collatedList} variant={collatedList === useCurrentList ? "primary" : "outline-primary"} onClick={function() {setCurrentList(collatedList)}}>
                                            //<Badge variant={completionVariant} > {collatedItems[collatedList].length} </Badge>
                                            //&nbsp;{collatedList}
                                        //</Button>
                                //} else {
                                    //return <Button variant={collatedList === useCurrentList ? "primary" : "outline-primary"} onClick={function() {setCurrentList(collatedList)}}>
                                            //<Badge variant="danger" > {collatedItems[collatedList].length}/{collatedCounts[collatedList]} </Badge>
                                            //&nbsp;{collatedList}
                                        //</Button>
                                //}
                                
                        //})}</span>
                                   
                                 //} else {
                                    //return null
                                //}
                            //})}
             //{Object.keys(collatedItems).map(function(collatedList, i) {
                                //var useCurrentList = currentList ? currentList : Object.keys(collatedItems)[0]
                                //if (collatedList === useCurrentList) {
                                    //return 
        //} else {
            //const skillsList = props.lookups.listLookups ? props.lookups.listLookups.map(function(listItem,i) {return <Button key={i}  onClick={function(e) {setListFilterValue(listItem)}}  style={{marginLeft:'1em'}} >{listItem}</Button>} )   : []
            //return <div>
                //<h1>Skills</h1>
                //{skillsList.length > 0 && skillsList}
                //{skillsList.length <= 0 && <div>
                    //You dont have any skills yet. Import some <Link to='/sources'><Button>Sources</Button></Link> 
                //</div>}
            //</div>
        //}
    }
    
  
    return <div>
       
        <Link style={{float:'right'}} to="/sources" ><Button variant="success" >Sources</Button></Link>
                   
        {<ListsManagerSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} />}
         
         
         {renderEditor(props)}
    </div>
            
}
      

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


