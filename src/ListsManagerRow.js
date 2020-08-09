/* global window */
import {Button,   Dropdown, ButtonGroup } from 'react-bootstrap'
import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTags from 'react-tag-autocomplete'
import {InputGroup } from 'react-bootstrap'
import useListItemRow from './useListItemRow'

export default function ListsManagerRow(props) {
        const  {item, splitNumber , style} = props;
       const {    
            tags, reactTags, 
            onTagDelete, onTagAddition, updateExampleContent,updateExampleSynonym,  selectItem, deselectItem
        } = useListItemRow(props.item, props.saveItem, props.splitNumber, props.style)
            
       
       //var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                   
                   <div style={{float:'right'}} > 
                        <Button  variant="danger"  size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {if (window.confirm('Really delete')) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}}} >X</Button>
               
                    </div>
                   
                  <div style={{float:'left'}}>
                     {!item.isSelected && <Button style={{float: 'left'}} size="lg" variant="secondary" onClick={function() {selectItem(splitNumber)}} ><img style={{height:'1em'}} src='/check.svg' alt="Select"  /></Button>}
                      {item.isSelected && <Button style={{float: 'left'}} size="lg" variant="success" onClick={function() {deselectItem(splitNumber)}} ><img style={{height:'1em'}} src='/check.svg' alt="Deselect"  /></Button>}
                </div>
                
                <input style={{float:'left'}} size='25'   
                       type='text'  value={item.value}  onChange={function(e) { updateExampleContent(e.target.value)}} />
                    
                     
                   
                     <label style={{float:'left', marginLeft:'0.5em'}} >Synonym <input size='15' type='text' value={item.synonym} onChange={function(e) {updateExampleSynonym(e.target.value)}} /></label>
                     
                     <span  style={{float:'left'}}>
                       <ReactTags
                        placeholderText="Add to list"
                        minQueryLength={1}
                        maxSuggestionsLength={50}
                        autoresize={false}
                        allowNew={true}
                        minQueryLength={1}
                        maxSuggestionsLength={50}
                        ref={reactTags}
                        tags={tags}
                        suggestions={props.lookups.listsLookups.map(function(listName,i) {return {id: i, name: listName}})}
                        onDelete={onTagDelete}
                        onAddition={onTagAddition} /> 
                        </span>
                  </div> 
               
                
                 
           
      </div>
}
