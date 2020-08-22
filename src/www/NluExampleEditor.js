import React, { useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import NluExampleRow from './NluExampleRow'
import EditorSearchBar from './components/EditorSearchBar'
import useNluEditor from './useNluEditor'
import {MatchesTallies,WithSelectedDropDowns} from './components/Components'
const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <NluExampleRow  
         item={item} splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} 
         lookups={props.data.lookups} setPageMessage={props.data.setPageMessage} />
}

export default function NluExampleEditor(props) {
    const {loadAll, deleteItem , items, findKeyBy, searchFilter, setSearchFilter, skillFilterValue, setSkillFilterValue, intentFilterValue, setIntentFilterValue, tagAllValue, setTagAllValue, skillAllValue, setSkillAllValue,  intentAllValue, setIntentAllValue, listRef, tagAll,untagAll, unskillAll, intentAll, resetSelection, selectAll,  skillSetAll, saveItemWrap, getItemSize, deleteAll, filteredItems, createEmptyItem, sort} = useNluEditor('nlutool','examples','alldata', props.updateFunctions.updateLookups)
    useEffect(() => {
        loadAll()
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
        // filter rendered list using callback 
       //var filteredItems = filter(function(item) {
                //if (!searchFilter || searchFilter.length <=0 ) return true;
                //const matchSearchFilter = item.example.indexOf(searchFilter) !== -1 
                        //|| item.intent.indexOf(searchFilter) !== -1 
                        //|| (item.tags && item.tags.indexOf(searchFilter) !== -1)
                //return matchSearchFilter && skillFilterValue && item.skills && item.skills.indexOf(skillFilterValue) !== -1
            //})
            
        if (filteredItems && filteredItems.length > 0) {
            return <div>
            <MatchesTallies items={items} filteredItems={filteredItems}/>
             {props.lookups.selectedTally > 0 && <span style={{float:'right'}}> 
                 <WithSelectedDropDowns
                  skillSetAll={skillSetAll} skillAllValue={skillAllValue}  setSkillAllValue={setSkillAllValue}  untagAll={untagAll} unskillAll={unskillAll} 
                     intentAll={intentAll} intentAllValue={intentAllValue} setIntentAllValue={setIntentAllValue}  
                     tagAll={tagAll} tagAllValue={tagAllValue} setTagAllValue={setTagAllValue}  lookups={props.lookups}
                 />
                 
                        
                
                 <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
               
            </span> } 
               
                <List
                    ref={listRef}
                    itemData={{items: filteredItems, saveItem: saveItemWrap, deleteItem, findKeyBy, lookups: props.lookups, setPageMessage: props.setPageMessage}}
                    itemKey={index => index}  
                    className="List"
                    height={700}
                    itemCount={filteredItems.length}
                    itemSize={getItemSize}
                    width={'100%'}
                  >{RenderRow}</List>
            </div>
        } else {
            //{JSON.stringify(filteredItems)}
            return <div >
             
                <div style={{textAlign:'center'}}>
            <br/><b>No items</b><br/><br/>Upload <Link to="/sources" ><Button>Sources</Button></Link> then <Link to="/import" ><Button>Import</Button></Link>.</div></div>
        }
    }
    
     return <div>
        <EditorSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} skillFilterValue={skillFilterValue} setSkillFilterValue={setSkillFilterValue} resetSelection={resetSelection} selectAll={selectAll}  createEmptyItem={createEmptyItem} intentFilterValue={intentFilterValue} setIntentFilterValue={setIntentFilterValue} untagAll={untagAll} unskillAll={unskillAll} sort={sort}  />
         {renderEditor(props)}
    </div>
    
}
      




