import {Route, Link} from 'react-router-dom'
import {Button, ListGroup,  Dropdown, ButtonGroup } from 'react-bootstrap'
import React, {useState, useEffect} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileReaderInput from 'react-file-reader-input';
import {generateObjectId, parentUrl} from './utils'
import { JsonEditor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
import useDB from './useDB'

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
    const { items} = props  
    
    function importExamples(item) {
         console.log(['import examples',item])
        if (props.fileSelected && item && item.id && item.data) {
            props.fileSelected(item.data)
        } else {
            throw new Error("Missing import data")
        }
    }
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {props.deleteItem(i)}} >Delete</Button>
                   <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>
                   <Link to={"../import"} ><Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { importExamples(items[i]) }}    >Import Examples</Button></Link>
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
    const [text, setText ] = useState(props.item && props.item.data ? props.item.data : '') 
    const [isJson, setIsJson ] = useState(false) 
    const [json, setJson ] = useState([]) 
    const [editorMode, setEditorMode] = useState('json')
    const [editorOptions, setEditorOptions] = useState(['json','text'])
    
    const id = props.match.params.itemId ? props.match.params.itemId  : generateObjectId()
    const { findKeyBy} = props  
    const index = findKeyBy('id',id)
   
    
    useEffect(() => {
        try {
            if ((text[0] === "[" && text[text.length - 1] === "]") || (text[0] === "{" && text[text.length - 1] === "}")) {
                var jsonParsed = JSON.parse(text)
                setJson(jsonParsed)
                setIsJson(true)
                setEditorOptions(['json','text'])
                setEditorMode('json')
            } else {
                setIsJson(false)
                setEditorOptions(['text'])
                setEditorMode('text')
            }
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
                
                {(text && title) && <Link to={parentLink} ><Button onClick={function(e) {props.saveItem({id:id,title:title,data:text},index)}} variant='success' >Save</Button></Link>}
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
    
    const {loadAll, saveItem, deleteItem ,items, findKeyBy, findBy} = useDB('nlutool','sources');
    
    
    // just on mount 
    useEffect(() => {
        loadAll()
        if (props.setPageTitle) props.setPageTitle('Sources')
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    function handleFileSelection(ev, results) {
        ev.preventDefault()
        if (results) {
            results.forEach(result => {
              const [e, file] = result;
               var item = {id:null, data:e.target.result, title:file.name}
                saveItem(item)
            });
            
        }
    }    
    
    var fileSelected = props.fileSelected
    return (
        <div className="LocalStorageUploadManager" >
            <Route 
                path={[`${props.match.path}/text/:itemId?`, `${props.match.path}/text`]}  
                render={(props) => <TextEditor {...props} 
                    item={findBy('id',props.match.params.itemId)} 
                    startWaiting={props.startWaiting} stopWaiting={props.stopWaiting} handleFileSelection={handleFileSelection} 
                    saveItem={saveItem} deleteItem={deleteItem} findKeyBy={findKeyBy} 
                    intentLookups={props.intentLookups}  entityLookups={props.entityLookups}  
                />}     
            />
            <Route {...props} exact path={props.match.path} 
                render={(props) => <IndexPage {...props} 
                    fileSelected={fileSelected} items={items} startWaiting={props.startWaiting} stopWaiting={props.stopWaiting}  handleFileSelection={handleFileSelection}
                    deleteItem={deleteItem} saveItem={saveItem} 
                    intentLookups={props.intentLookups} entityLookups={props.entityLookups}
                />} 
            />

        </div>
    );
}
