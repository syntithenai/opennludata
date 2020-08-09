import React, {useState, useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button, Dropdown, Badge, } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import NluSkillsRow from './NluSkillsRow'
import TagAllDropDown from './components/TagAllDropDown'
import IntentAllDropDown from './components/IntentAllDropDown'
import SkillAllDropDown from './components/SkillAllDropDown'

import EditorSearchBar from './components/EditorSearchBar'
import useNluEditor from './useNluEditor'

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <NluSkillsRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups} />
}

export default  function NluSkillsEditor(props) {
    const {loadAll, deleteItem , findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, skillAllValue, setSkillAllValue, skillFilterValue, setSkillFilterValue, intentAllValue, setIntentAllValue, listRef, tagAll, intentAll, resetSelection, selectAll,  skillSetAll, saveItemWrap, getItemSize,  saveNlu, filteredItems, createEmptyItem} = useNluEditor('nlutool','examples','alldata', props.updateLookups)
    const [currentIntent, setCurrentIntent] = useState('')
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
       
        if (skillFilterValue && skillFilterValue.length > 0) {
            
            // filter rendered list using callback 
            //var filteredItems = filter(function(item) {
                //if (!searchFilter || searchFilter.length <=0 ) return true;
                //const matchSearchFilter = item.example.indexOf(searchFilter) !== -1 
                        //|| item.intent.indexOf(searchFilter) !== -1 
                        //|| (item.tags && item.tags.indexOf(searchFilter) !== -1)
                //return matchSearchFilter && skillFilterValue && item.skills && item.skills.indexOf(skillFilterValue) !== -1
                
            //})
             var collatedItems={}
             var collatedCounts={}
             if (filteredItems) {
                 filteredItems.map(function(item) {
                    if (item.intent) {
                        if (!collatedItems[item.intent]) collatedItems[item.intent]=[]
                        collatedCounts[item.intent] =   (collatedCounts[item.intent] > 0) ? collatedCounts[item.intent] + 1 : 1;
                        //if (collatedItems[item.intent].length < 300) {
                            collatedItems[item.intent].push(item)
                        //}
                        
                    }
                   return null;  
                 })
             }   
                
                
            if (filteredItems && filteredItems.length > 0) {
               
               //var tagOptions = props.lookups.tagLookups && props.lookups.tagLookups.sort().map(function(tagKey,i) {
                  //return <Dropdown.Item key={i} value={tagKey} onClick={function(e) {setTagAllValue(tagKey); tagAll(tagKey)}}  >{tagKey}</Dropdown.Item>
               //})
               //var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
                  //return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {setIntentAllValue(intentKey);intentAll(intentKey)}}  >{intentKey}</Dropdown.Item>
               //})
                return <div>
        
             {props.lookups.selectedTally > 0 && <span style={{float:'right'}}> 
                <span>With {props.lookups.selectedTally} selected&nbsp;</span>
                
                       <SkillAllDropDown skillSetAll={skillSetAll} skillAllValue={skillAllValue}  setSkillAllValue={setSkillAllValue}  lookups={props.lookups}/>
                <IntentAllDropDown intentAll={intentAll} intentAllValue={intentAllValue} setIntentAllValue={setIntentAllValue}  lookups={props.lookups}/>
                <TagAllDropDown tagAll={tagAll} tagAllValue={tagAllValue} setTagAllValue={setTagAllValue}  lookups={props.lookups}/>
                
                </span> } 
                    
                   
                    
                    
                      <div style={{clear:'both'}}>
                        <span>{Object.keys(collatedItems).map(function(collatedIntent, i) {
                                var useCurrentIntent = currentIntent ? currentIntent : Object.keys(collatedItems)[0]
                                //const warning = <b>{collatedItems[collatedIntent].length}/{collatedCounts[collatedIntent].length}</b>
                                //collatedItems[collatedIntent].length  === collatedCounts[collatedIntent].length ? <b>/dd{collatedCounts[collatedIntent].length}</b> : <b>/{collatedCounts[collatedIntent].length}</b>
                                var completionVariant = 'danger'
                                if (collatedItems[collatedIntent].length > 300) {
                                    completionVariant = 'success'
                                } else if (collatedItems[collatedIntent].length > 100) {
                                    completionVariant = 'primary'
                                } else if (collatedItems[collatedIntent].length > 10) {
                                    completionVariant = 'warning'
                                } 
                                
                                
                                if (collatedItems[collatedIntent].length  === collatedCounts[collatedIntent]) {
                                        return <Button key={collatedIntent} variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} onClick={function() {setCurrentIntent(collatedIntent)}}>
                                            <Badge variant={completionVariant} > {collatedItems[collatedIntent].length} </Badge>
                                            &nbsp;{collatedIntent}
                                        </Button>
                                } else {
                                    return <Button variant={collatedIntent === useCurrentIntent ? "primary" : "outline-primary"} onClick={function() {setCurrentIntent(collatedIntent)}}>
                                            <Badge variant="danger" > {collatedItems[collatedIntent].length}/{collatedCounts[collatedIntent]} </Badge>
                                            &nbsp;{collatedIntent}
                                        </Button>
                                }
                                
                        })}</span>
                       
                        <div style={{clear:'both'}}>
                            {Object.keys(collatedItems).map(function(collatedIntent, i) {
                                var useCurrentIntent = currentIntent ? currentIntent : Object.keys(collatedItems)[0]
                                if (collatedIntent === useCurrentIntent) {
                                    return <List
                                        key="list"
                                        ref={listRef}
                                        itemData={{items: collatedItems[collatedIntent], saveItem: saveItemWrap, saveNlu, deleteItem, findKeyBy, lookups: props.lookups}}
                                        itemKey={index => index}  
                                        className="List"
                                        height={700}
                                        itemCount={collatedItems[collatedIntent].length}
                                        itemSize={getItemSize}
                                        width={'100%'}
                                      >{RenderRow}</List>
                                    
                                   
                                 } else {
                                    return null
                                }
                            })}
                        </div>
                    </div>
               
                </div>

            }
            
        } else {
            const skillsList = props.lookups.skillLookups ? props.lookups.skillLookups.map(function(skill,i) {return <Button key={i}  onClick={function(e) {setSkillFilterValue(skill)}}  style={{marginLeft:'1em'}} >{skill}</Button>} )   : []
            return <div>
                <h1>Skills</h1>
                {skillsList.length > 0 && skillsList}
                {skillsList.length <= 0 && <div>
                    You dont have any skills yet. Import some <Link to='/sources'><Button>Sources</Button></Link> 
                </div>}
            </div>
        }
    }
    
     var skillOptions = props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setSkillFilterValue(skillKey)}}  >{skillKey}</Dropdown.Item>
       })
       skillOptions.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {setSkillFilterValue('')}}  >&nbsp;</Dropdown.Item>)
       
    //return <div>
        //{skillFilterValue && <Button style={{float:'right', marginLeft:'1em'}} onClick={function(e) {} } variant="success"  >Publish</Button> }
                    
        //{skillFilterValue && <span style={{float:'left'}} >
            
            //{props.lookups.selectedTally > 0 && <Button size="lg"  onClick={function(e) { resetSelection(e) }} variant="success"  ><img style={{height:'1em'}} src='/check.svg' alt="Select"  /></Button> }
            //{props.lookups.selectedTally <= 0 && <Button size="lg" onClick={function(e) { selectAll(e) }} variant="secondary"  ><img style={{height:'1em'}} src='/check.svg' alt="Deselect"  /></Button> }
            //{skillFilterValue && skillFilterValue.length > 0 && <span><SearchInput searchFilter={searchFilter} setSearchFilter={setSearchFilter} /></span>}
           //</span>}   
               //{skillFilterValue && skillFilterValue.length > 0 &&  <Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  //<Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  //<Button  >{'Skill '+(skillFilterValue ? ' - '+ skillFilterValue : '')} </Button>
                  //<Dropdown.Menu>
                      //{skillOptions}
                  //</Dropdown.Menu>
                //</Dropdown>}
                  
              //{renderEditor(props)}
        //</div>
    return <div>
        {skillFilterValue && <EditorSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} skillFilterValue={skillFilterValue} setSkillFilterValue={setSkillFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} />}
         {renderEditor(props)}
    </div>
            
}
      




