/* global window */
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom'
import { useHistory } from "react-router-dom";
import {Button, Navbar, ListGroup,  Dropdown, ButtonGroup } from 'react-bootstrap'
import React, {useState, useEffect, memo, useCallback} from 'react';
import {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileReaderInput from 'react-file-reader-input';
import { FixedSizeList as List } from 'react-window';
import {NavbarComponent, HelpText} from './Components'
import useLocalStorageManager from './useLocalStorageManager'
import {generateObjectId, parentUrl, parseImportText} from './utils'
import NluEditorList from './NluEditorList'
//import NluExampleRow from './NluExampleRow'


function NluExampleRow(props) {
    //{JSON.stringify(props)}
    return <b><input value={props.item.example} onChange={function (e) {props.saveItem({...props.item,example:e.target.value})}} /></b>
}


const RenderRow = function(props) {
    console.log(['RENDER SPLIT ROW',props])
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    //saveItem={props.saveItem} deleteItem={props.deleteItem}
     //splitNumber={index} item={item} entities={item && item.entities && typeof item.entities == "array" ? item.entities : []} style={style} 
    return (<NluExampleRow  deleteItem={props.data.deleteItem} 
     item={item}  splitNumber={index} saveItem={props.data.saveItem}
     intentLookups={props.data.intentLookups} 
     entityLookups={props.data.entityLookups}   /> )
}
//,function(oldProps,newProps) {
    //console.log(['SHOULD UPDATE splitrow',oldProps.length === newProps.length,oldProps,newProps])
    //function getItemJSON(props) {
        //return JSON.stringify(props.index && props.data && props.data[props.index] ? props.data[props.index] : {})
    //}
    //return (getItemJSON(oldProps) == getItemJSON(newProps))  
//})

function NluExampleEditor(props) {
    // for export to main tables
    
    const {getLocalStorageKey, getLocalStorageItemKey, loadAll, saveItem, deleteItem , getItemData, items, setItems} = useLocalStorageManager('nlutool_import_examples')
    
    useEffect(() => {
        console.log(['IMPORT FROM load effect ',props.importFrom])
        if (props.importFrom) {
            console.log(['IMPORT FROM ',props.importFrom])
            var parsed = parseImportText(props.importFrom)
            console.log(['PARSED',parsed])
            setItems(parsed)
        } else {
            loadAll()
        }
    },[])
    
    useEffect(() => {
        console.log(['IMPORT FROM update effect ',props.importFrom])
        if (props.importFrom) {
            console.log(['IMPORT FROM ',props.importFrom])
            var parsed = parseImportText(props.importFrom)
            console.log(['PARSED',parsed])
            setItems(parsed)
        }
    },[props.importFrom])
    
    //function deleteIte(splitNumber,entityNumber) {
        //console.log(['delspl',splitNumber,items[splitNumber]])
        //deleteItem(splitNumber, items[splitNumber] ? items[splitNumber].id : null)
    //}
    
    
 
    function saveNlu(splitNumber) {
        if (items && items[splitNumber]) {
            props.saveNluItem(items[splitNumber]) 
            //deleteSplit(splitNumber)
        }
    }

    console.log('RENDER list')    
    return <List
        itemData={{items,saveItem,deleteItem,getItemData, intentLookups: props.intentLookups, entityLookups: props.entityLookups}}
        itemKey={index => index}  
        className="List"
        height={100}
        itemCount={items.length}
        itemSize={90}
        width={'100%'}
        useIsScrolling
      >{RenderRow}</List>
}
      
export default memo(NluExampleEditor,function(oldProps,newProps) {
    console.log(['SHOULD UPDATE list',oldProps.items && newProps.items && oldProps.items.length === newProps.items.length,oldProps,newProps])    
    return (oldProps.items && newProps.items && oldProps.items.length === newProps.items.length) 
})




