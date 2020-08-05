/* global window */
import React, {useState, useEffect} from 'react';
import './App.css';
import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import {parseImportText} from './utils'
import NluImportRow from './NluImportRow'
import useDBSingleKey from './useDBSingleKey'

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <NluImportRow  
         item={item}  setItem={props.data.setItem} splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups} />
}

export default function NluImportEditor(props) {
    const {loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter} = useDBSingleKey('nlutool','import','alldata')
    const examplesDB = useDBSingleKey('nlutool','examples','alldata')
    const [searchFilter, setSearchFilter] = useState('')
    const [tagAllValue, setTagAllValue] = useState('')
    const [skillAllValue, setSkillAllValue] = useState('')
    const [intentAllValue, setIntentAllValue] = useState('')
    const importFrom = props.importFrom
    const listRef = React.createRef()
    useEffect(() => {
        loadAll()
        examplesDB.loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    useEffect(() => {
        if (importFrom) {
            var parsed = parseImportText(importFrom)
            setItems(parsed)
            props.setImportFrom('')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.importFrom])
    
    useEffect(() => {
        props.updateLookups(items)
    },[items])
    
    
    
    function saveNlu(splitNumber) {
        if (items && items[splitNumber]) {
            //props.saveNluItem(items[splitNumber]) 
            examplesDB.saveItem(items[splitNumber])
            deleteItem(splitNumber)
        }
    }
    
    function saveAll(e)  {
        if (items) {
            var newItems = []
            items.map(function(item,i) {
               if (!item.isSelected) {
                   newItems.push(item)
               }  
            })
            setItems(newItems)
            listRef.current.resetAfterIndex(0);
        }
         
    }
    
    function tagAll(val) {
        console.log(['tagall',tagAllValue,val])
        var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.tags) newItem.tags=[]
                   if (newItem.tags.indexOf(tagValue) === -1) newItem.tags.push(tagValue)
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               
            })
            setItems(newItems)
        }
    }
    
    function intentAll(val) {
        console.log(['intentall',intentAllValue,val])
        var intentValue = val ? val : intentAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected) {
                   var newItem = item
                   newItem.intent = intentValue
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               
            })
            setItems(newItems)
        }
    }
    function resetSelection() {
         if (items) {
            var newItems = []
            items.map(function(item,i) {
               var newItem = item
               newItem.isSelected = false
               newItems.push(newItem)
            })
            setItems(newItems)
        }
    }
    
     function selectAll() {
         if (items) {
            var newItems = []
            items.map(function(item,i) {
               var newItem = item
               newItem.isSelected = true
               newItems.push(newItem)
           
            })
            setItems(newItems)
        }
    }
    
     function skillSetAll(val) {
         console.log(['set skill all',tagAllValue,val])
        var skillValue = val ? val : skillAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.skills) newItem.skills=[]
                   if (newItem.skills.indexOf(skillValue) === -1) newItem.skills.push(skillValue)
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               
            })
            setItems(newItems)
        }
    }
    
    
    function saveItemWrap(item,index) {
        saveItem(item,index)
        listRef.current.resetAfterIndex(index);
        props.updateLookups(items)
    }
    
    function getItemSize(index) {
        console.log(window.innerWidth,window.innerHeight)
        // set parameters for full size > 1024
        var baseSize = 100
        var heightPerLine = 70
        var tagsPerLine = 10
        var entitiesPerLine = 8
        var skillsPerLine = 6
        // tiny screen mobile 
        if (window.innerWidth < 430) {
            baseSize = 120
            heightPerLine = 50
            tagsPerLine = 4
            entitiesPerLine = 1
            skillsPerLine = 1
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
            baseSize = 120
            heightPerLine = 30
            tagsPerLine = 2
            entitiesPerLine = 1
            skillsPerLine = 2
        }
        var tallyExtras = 0;
        var item = items[index]
        if (item && item.entities) tallyExtras += item.entities.length/entitiesPerLine;
        if (item && item.tags) tallyExtras += item.tags.length/tagsPerLine;
        if (item && item.skills) tallyExtras += item.skills.length/skillsPerLine;
        var size = baseSize + (Math.round(tallyExtras)) * heightPerLine
        //console.log(['ITEM SIZE',size, baseSize,heightPerLine,tagsPerLine,entitiesPerLine,tallyExtras,item])
        return size 
    }
    

    // filter rendered list using callback 
    var filteredItems = (searchFilter && searchFilter.length > 0) ? filter(function(item) {
            return (item.example.indexOf(searchFilter) !== -1 || item.intent.indexOf(searchFilter) !== -1 || item.tags && item.tags.indexOf(searchFilter) !== -1)   
        }) : items
        
    if (filteredItems && filteredItems.length > 0) {
        
        var skillOptions = props.lookups.skillLookups && props.lookups.skillLookups.sort().map(function(skillKey,i) {
          return <Dropdown.Item key={i} value={skillKey} onClick={function(e) {setSkillAllValue(skillKey); skillSetAll(skillKey)}}  >{skillKey}</Dropdown.Item>
       })
        var tagOptions = props.lookups.tagLookups && props.lookups.tagLookups.sort().map(function(tagKey,i) {
          return <Dropdown.Item key={i} value={tagKey} onClick={function(e) {setTagAllValue(tagKey); tagAll(tagKey)}}  >{tagKey}</Dropdown.Item>
       })
       var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
          return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {setIntentAllValue(intentKey);intentAll(intentKey)}}  >{intentKey}</Dropdown.Item>
       })
        return <div>
        {props.lookups.selectedTally > 0 && <span style={{float:'right'}}> 
            <span>With selected </span>
            <Dropdown  as={ButtonGroup}>
              <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
              <Button   size="sm" >{'Skill'} </Button>
              <Dropdown.Menu>
               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; skillSetAll(e.target.value)}} >
                    <div className="form-group">
                      <input type="text" className="form-control" onChange={function(e) {setSkillAllValue(e.target.value)}}
                    value={skillAllValue} />
                    </div>
                  </form>
                  {skillOptions}
              </Dropdown.Menu>
              </Dropdown>
              
            <Dropdown  as={ButtonGroup}>
              <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
              <Button   size="sm" >{'Intent'} </Button>
              <Dropdown.Menu>
               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; intentAll(e.target.value)}} >
                    <div className="form-group">
                      <input type="text" className="form-control" onChange={function(e) {setIntentAllValue(e.target.value)}}
                    value={intentAllValue} />
                    </div>
                  </form>
                  {intentOptions}
              </Dropdown.Menu>
              </Dropdown>
            
            <Dropdown  as={ButtonGroup}>
              <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
              <Button   size="sm" >{'Tag'} </Button>
              <Dropdown.Menu>
               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; tagAll(e.target.value)}} >
                    <div className="form-group">
                      <input type="text" className="form-control" onChange={function(e) {setTagAllValue(e.target.value)}}
                    value={tagAllValue} />
                    </div>
                  </form>
                  {tagOptions}
              </Dropdown.Menu>
              </Dropdown>
            <Button style={{marginLeft:'1em'}} onClick={saveAll} variant="success"  >Save Selected</Button> 
            
        </span> } 
            
            {props.lookups.selectedTally > 0 && <Button size="lg"  onClick={function(e) { resetSelection(e) }} variant="success"  ><img src='/check.svg' /></Button> }
            {props.lookups.selectedTally <= 0 && <Button size="lg" onClick={function(e) { selectAll(e) }} variant="secondary"  ><img src='/check.svg' /></Button> }
            
            
            <input type='text' value={searchFilter} 
            onChange={
                function(e) {
                    const filter = e.target.value
                    setSearchFilter(filter); 
                }
            }
            placeholder='Search' />
            
            <List
                ref={listRef}
                itemData={{items: filteredItems, setItems, saveItem: saveItemWrap, selectedTally: props.selectedTally, saveNlu, deleteItem, findKeyBy, lookups:props.lookups}}
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
         <input type='text' value={searchFilter} 
            onChange={
                function(e) {
                    const filter = e.target.value
                    setSearchFilter(filter); 
                }
            } placeholder='Search' />
            <div style={{textAlign:'center'}}>
        <br/><b>No more items</b><br/><br/>Open <Link to="/sources" ><Button>Sources</Button></Link> to create more.</div></div>
    }
}
      

