import React, {useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import NluImportRow from './NluImportRow'
import EditorSearchBar from './components/EditorSearchBar'
import useNluEditor from './useNluEditor'
import TagAllDropDown from './components/TagAllDropDown'
import IntentAllDropDown from './components/IntentAllDropDown'
import SkillAllDropDown from './components/SkillAllDropDown'
import arrowthickleftImage from './images/arrow-thick-left.svg'
import arrowthickrightImage from './images/arrow-thick-right.svg'


const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    //console.log(['USENLUROW rr',index])
    return <NluImportRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups}  setPageMessage={props.data.setPageMessage} />
}


export default function NluImportEditor(props) {
    
    //const examplesDB = useDBSingleKey('nlutool','examples','alldata')
    const {loadAll, deleteItem ,items,  findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, skillAllValue, setSkillAllValue, skillFilterValue, setSkillFilterValue, intentFilterValue, setIntentFilterValue, intentAllValue, setIntentAllValue, listRef, tagAll, untagAll, unskillAll, intentAll, resetSelection, selectAll,  skillSetAll, saveItemWrap, getItemSize, deleteAll, saveAll, saveNlu, filteredItems, createEmptyItem, sort} = useNluEditor('nlutool','import','alldata', props.updateFunctions.updateLookups, props.updateFunctions.setIsChanged)
    useEffect(() => {
        loadAll()
        //examplesDB.loadAll()
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
       
         //filteredItems.sort(function(oldItem,item) {console.log( ['SORT',oldItem.example,item.example]); return (item.example && oldItem.example && item.example.trim().toLowerCase <= oldItem.example.trim().toLowerCase) })
           
        if (filteredItems && filteredItems.length > 0) {
            
           //var skillOptions = props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
                  //return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setSkillAllValue(skillKey); skillSetAll(skillKey)}}  >{skillKey}</Dropdown.Item>
            //})
            
            //var tagOptions = props.lookups.tagLookups && props.lookups.tagLookups.sort().map(function(tagKey,i) {
              //return <Dropdown.Item key={i} value={tagKey} onClick={function(e) {setTagAllValue(tagKey); tagAll(tagKey)}}  >{tagKey}</Dropdown.Item>
           //})
           //var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
              //return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {setIntentAllValue(intentKey);intentAll(intentKey)}}  >{intentKey}</Dropdown.Item>
           //})
            return <div>
             <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length}/{items.length} matches </span>
             {props.lookups.selectedTally > 0 && <span style={{float:'right'}}> 
                <span>With {props.lookups.selectedTally} selected&nbsp;
              <SkillAllDropDown skillSetAll={skillSetAll} skillAllValue={skillAllValue}  setSkillAllValue={setSkillAllValue}  lookups={props.lookups}  untagAll={untagAll} unskillAll={unskillAll}/>
                <IntentAllDropDown intentAll={intentAll} intentAllValue={intentAllValue} setIntentAllValue={setIntentAllValue}  lookups={props.lookups}  untagAll={untagAll} unskillAll={unskillAll}/>
                <TagAllDropDown tagAll={tagAll} tagAllValue={tagAllValue} setTagAllValue={setTagAllValue}  lookups={props.lookups}  untagAll={untagAll} unskillAll={unskillAll}/>
                
                </span>
                <Button style={{marginLeft:'1em'}} onClick={saveAll} variant="success"  >Save Selected</Button> 
                <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                
            </span> } 
                
              
                
                <List
                    ref={listRef}
                    itemData={{items: filteredItems, saveItem: saveItemWrap, saveNlu, deleteItem, findKeyBy, lookups:props.lookups, setPageMessage: props.setPageMessage}}
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
            <br/><b>No more items to import</b><br/><br/>Open <Link to="/sources" ><Button><img style={{height:'1em', paddingRight:'1em'}}  src={arrowthickleftImage} alt="Sources" />Sources</Button></Link> to create more or <Link to="/examples" ><Button>Organise<img src={arrowthickrightImage} alt="Intents" style={{height:'1em', paddingLeft:'1em'}}  /></Button></Link> what you have imported into skills.
            </div></div>
        }
    }
    // {JSON.stringify(items)}
    return <div>
         
        <EditorSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} skillFilterValue={skillFilterValue} setSkillFilterValue={setSkillFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} untagAll={untagAll} unskillAll={unskillAll} intentFilterValue={intentFilterValue} setIntentFilterValue={setIntentFilterValue}  sort={sort} />
         {renderEditor(props)}
    </div>
    
    
}
      

