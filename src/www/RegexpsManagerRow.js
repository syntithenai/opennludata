/* global window */
import {Button } from 'react-bootstrap'
import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTags from 'react-tag-autocomplete'
import useListItemRow from './useListItemRow'
import SuggestionComponent from './components/SuggestionComponent'
import TagComponent from './components/TagComponent'
import checkImage from './images/check.svg'

export default function UtterancesManagerRow(props) {
        const  {item, splitNumber , style} = props;
       const {    
            tags, reactTags, 
            onTagDelete, onTagAddition, updateExampleContent,updateExampleSynonym,  selectItem, deselectItem
        } = useListItemRow(props.item, props.saveItem, props.splitNumber, props.style, props.lastSelected, props.setLastSelected, props.selectBetween)
        
        
       //var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                   
                   <div style={{float:'right'}} > 
                        <Button  variant="danger"  size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {if (window.confirm('Really delete')) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}}} >X</Button>
               
                    </div>
                   
                  <div style={{float:'left'}}>
                     {!item.isSelected && <Button style={{float: 'left'}} size="lg" variant="secondary" onClick={function(e) {selectItem(splitNumber,e)}} ><img style={{height:'1em'}} src={checkImage} alt="Select"  /></Button>}
                      {item.isSelected && <Button style={{float: 'left'}} size="lg" variant="success" onClick={function() {deselectItem(splitNumber)}} ><img style={{height:'1em'}} src={checkImage} alt="Deselect"  /></Button>}
                  </div>
                  
                  <label><span style={{float:'left', marginLeft:'0.5em', marginRight:'0.5em'}}>Description </span> <input style={{float:'left'}} size='50'   
                       type='text'  value={item.value}  onChange={function(e) { updateExampleContent(e.target.value)}} /></label>
                
                   <label style={{float:'right', marginRight:'2em'}} >
                     <span  style={{float:'left', marginRight:'0.5em'}}>Tags </span>
                     <span  style={{float:'left'}}>
                       <ReactTags
                        placeholderText="Add tag"
                        minQueryLength={0}
                        maxSuggestionsLength={50}
                        autoresize={false}
                        allowNew={true}
                        ref={reactTags}
                        tags={tags}
                        tagComponent={function(iprops) {return <TagComponent {...iprops}   setRegexpEntity={props.setRegexpEntity} setRegexpIntent={props.setRegexpIntent}  lookups={props.lookups}  />}}
                        suggestionComponent={SuggestionComponent}
                        suggestions={props.lookups.regexpTagsLookups.map(function(listName,i) {return {id: i, name: listName}})}
                        onDelete={onTagDelete.bind(this)}
                        onAddition={onTagAddition.bind(this)} /> 
                        </span>
                    </label>
                    <label style={{float:'left', marginLeft:'0.5em'}} ><span style={{float:'left', marginRight:'0.5em'}}>Regular Expression</span> 
                        <textarea style={{width:'60em',height:'6em'}}  type='text' value={item.synonym} onChange={function(e) {updateExampleSynonym(e.target.value)}} />
                    </label>
                    
                    
                  </div> 
               
                
                 
           
      </div>
}
