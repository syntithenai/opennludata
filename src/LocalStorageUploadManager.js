/* global window */
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom'
import { useHistory } from "react-router-dom";
import {Button, Navbar, ListGroup,  Dropdown, ButtonGroup } from 'react-bootstrap'
import React, {useState, useEffect, useRef} from 'react';
import {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileReaderInput from 'react-file-reader-input';
import { FixedSizeList as List } from 'react-window';
import {NavbarComponent, HelpText, NluExampleRowComponent} from './Components'
import useLocalStorageManager from './useLocalStorageManager'
import {generateObjectId, parentUrl} from './utils'
import { JsonEditor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';

// COMPONENTS

function FileSelector(props) {
    return <form onSubmit={function(e) {e.preventDefault()}} style={{float:'right'}}>
            <FileReaderInput multiple as="binary" id="my-file-input"
                             onChange={props.handleFileSelection}>
              <Button style={{ marginRight:'0.5em'}} >Select files</Button>
            </FileReaderInput>
          </form>
}

function NewFileButtons(props) {
    return <span>
        <Link to={props.match.url + '/text'} style={{float:'right'}} ><Button>Paste Text</Button></Link>
        <FileSelector {...props}/>   
    </span>
}

function FilesList(props) {
    //const [text, setText ] = useState('') 
    const {getLocalStorageKey, getLocalStorageItemKey, loadAll, saveItem, deleteItem , getItemData, items, setItems, fileSelected} = props  
   //.slice(1,-1).replace(/\\/g, '')
     //const fileSelected = props.fileSelected
     //console.log(props)
     function importExamples(item) {
         console.log(['import examples',item])
        //var item = findById(items,props.match.params.itemId)
        if (item && item.id) {
            //console.log(['startwait',props.startWaiting])
            getItemData(item.id).then(function(data) {
                //console.log(['fgot data',data]); 
                props.fileSelected(data ? data : '')
                //console.log(['stopwait',props.stopWaiting])
              //  props.history.push("/import")
            })
        }
    }
     //
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {props.deleteItem(i, item.id)}} >Delete</Button>
                   <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>
                   <Link to={"../import"} ><Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) {console.log('a'+typeof props.fileSelected); if (props.fileSelected && typeof props.fileSelected ==="function" ) {importExamples(items[i])  }}}    >Import Examples</Button></Link>
                   <span style={{width:'90%'}}  >{item.title}</span>
               </ListGroup.Item>
        })
        return <ListGroup>{list}</ListGroup>
    } else {
        return null
    }
}

function IndexPage(props) {
    return <div>
                 <NewFileButtons {...props} />
                 <h1>Sources</h1>
                 <FilesList {...props} />
            </div>
}



function TextEditor(props) {
    const [title,setTitle] = useState(props.item && props.item.title ? props.item.title : '')
    const [text, setText ] = useState('') 
    const [isJson, setIsJson ] = useState(false) 
    const [json, setJson ] = useState([]) 
    const [editorMode, setEditorMode] = useState('json')
    const [editorOptions, setEditorOptions] = useState(['json','text'])
    
    const [id, setId ] = useState((props.match.params.itemId ? props.match.params.itemId  : generateObjectId()))
    const { saveItem, deleteItem , getItemData, item} = props  //useLocalStorageManager('nlutool_sources');
    var jsonParsed = {}
    useEffect(() => {
        //var item = findById(items,props.match.params.itemId)
        if (item) {
            //console.log(['startwait',props.startWaiting])
            getItemData(id).then(function(data) {
                //console.log(['fgot data',data]); 
                setText(data ? data : '')
                //console.log(['stopwait',props.stopWaiting])
            })
        }
    },[])
    useEffect(() => {
        try {
            jsonParsed = JSON.parse(text)
            setJson(jsonParsed)
            setIsJson(true)
            setEditorOptions(['json','text'])
            setEditorMode('json')
        } catch (e) {
            setIsJson(false)
            setEditorOptions(['text'])
            setEditorMode('text')
        }
    },[text])
     
    var parentLink = parentUrl(props.match.url)
    var linkParts = props.match.url.split("/")
    // link up two where id is present
    if (linkParts[linkParts.length -1] !== "text") {
       parentLink = parentUrl(parentUrl(props.match.url)) 
    }
    var editorModeOptions = editorOptions.map(function(value,j) {
      return <Dropdown.Item key={j} value={value} onClick={function(e) {setEditorMode(value); }}  >{value}</Dropdown.Item>
   })
    
    //console.log(['RENDER',isJson,text])
    return <div style={{minHeight:'60em'}}>
          <Dropdown variant='info'  as={ButtonGroup}>

          <Dropdown.Toggle variant='info'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button variant='info'   size="sm"  >
          <b>{editorMode}</b>
          </Button>
          <Dropdown.Menu>
              {editorModeOptions}
          </Dropdown.Menu>
        </Dropdown>

            <span style={{float:'right'}} >
                
                {(text && title) && <Link to={parentLink} ><Button onClick={function(e) {props.saveItem({id:id,title:title,data:text})}} variant='success' >Save</Button></Link>}
                {!(text && title) && <Button variant='secondary' >Save</Button>}
                
                <Link  to={parentLink} ><Button variant="danger" >Cancel</Button></Link>
            </span>
            <label>&nbsp;Title <input size={60}  type='text' onChange={function(e) { setTitle(e.target.value)}}  value={title} /></label>
            {(!isJson || editorMode === "text") && <textarea style={{marginLeft: '0.2em', height:'100%', minHeight:'60em', width:'98%'}}  onChange={function(e) { setText(e.target.value)}}  value={text} ></textarea>}
            {(isJson && editorMode === "json") && <div style={{marginLeft: '0.2em', height:'100%', minHeight:'60em', width:'98%'}} >
                <JsonEditor
                value={json}
                theme={"ace/theme/github"}
                ace={ace}
                history={true}
                mode={'code'}
                allowedModes={['tree','code']}
                onChange={function(value) { setText(JSON.stringify(value))}}
            /></div>}
           
    </div>
}



export default function LocalStorageUploadManager(props) {
    
    const {getLocalStorageKey, getLocalStorageItemKey, loadAll, saveItem, deleteItem , getItemData, items, setItems, findKeyBy, findBy} = useLocalStorageManager('nlutool_sources');
    
    // just on mount 
    useEffect(() => {
        loadAll()
    },[])
    
    function handleFileSelection(ev, results) {
        //ev.preventDefault()
        var that = this;
        //console.log('file upoload')
        if (results) {
            results.forEach(result => {
              const [e, file] = result;
               var item = {id:null, data:e.target.result, title:file.name}
                //console.log(['file upoload',item])
                saveItem(item)
            });
            
        }
        //return false;
    }    
    


    var fileSelected = props.fileSelected
    return (
        <div className="LocalStorageUploadManager" >
            <Route 
                path={[`${props.match.path}/text/:itemId?`, `${props.match.path}/text`]}  
                render={(props) => <TextEditor {...props} item={findBy('id',props.match.params.itemId)} startWaiting={props.startWaiting} stopWaiting={props.stopWaiting} handleFileSelection={handleFileSelection} getLocalStorageKey={getLocalStorageKey}  getLocalStorageItemKey={getLocalStorageItemKey}  saveItem={saveItem} deleteItem={deleteItem} getItemData={getItemData} findBy={findBy} intentLookups={props.intentLookups} setIntentLookups={props.setIntentLookups} entityLookups={props.entityLookups} setEntityLookups={props.setEntityLookups}   />}     
            />
            <Route {...props} exact path={props.match.path} render={(props) => <IndexPage {...props} fileSelected={fileSelected} items={items} startWaiting={props.startWaiting} stopWaiting={props.stopWaiting}  deleteItem={deleteItem} handleFileSelection={handleFileSelection} getLocalStorageKey={getLocalStorageKey}  getLocalStorageItemKey={getLocalStorageItemKey} loadAll={loadAll} saveItem={saveItem} deleteItem={deleteItem} getItemData={getItemData}  setItems={setItems}  intentLookups={props.intentLookups} setIntentLookups={props.setIntentLookups} entityLookups={props.entityLookups} setEntityLookups={props.setEntityLookups}    />} />

        </div>
    );
}
//fileSelected={function(dataText) { var data = JSON.parse(dataText);  return fileSelected(getItemData(data.id))}}
