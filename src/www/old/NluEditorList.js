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
import NluExampleRow from './NluExampleRow'




export default function NluEditorList(props) {
    console.log('RENDER LIST')    
    var renderSplitRow = function(data) {
        var splitNumber = data.index
        var style = data.style
        var item = props.items[splitNumber]
        console.log(['RENDER SPLIT ROW',splitNumber,item,data])
        return (<NluExampleRow  saveNlu={props.saveNlu} createSelection={props.createSelection} deleteSplit={props.deleteSplit} updateSplitContent={props.updateSplitContent} entityClicked={props.entityClicked} intentChanged={props.intentChanged} entityTypeChanged={props.entityTypeChanged} entityDelete={props.entityDelete} 
         splitNumber={splitNumber} item={item} style={style} 
         intentLookups={props.intentLookups} setIntentLookups={props.setIntentLookups} 
         entityLookups={props.entityLookups} setEntityLookups={props.setEntityLookups} saveNluItem={props.saveNluItem}   /> )
    }  
    ////return <b>{JSON.stringify(props.items)}</b>
    return <List
        className="List"
        height={100}
        itemCount={props.items.length}
        itemSize={90}
        width={'100%'}
        useIsScrolling
      >{renderSplitRow}</List>
      //return <b>dsdfsdf</b>
}
