import {Link} from 'react-router-dom'
import {Button,  Dropdown, ButtonGroup } from 'react-bootstrap'
import React, {useState, useEffect} from 'react';
//import FileReaderInput from 'react-file-reader-input';
import {generateObjectId, parentUrl} from '../utils'
import { JsonEditor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
//import useDB from './useDB'
//import useDBSingleKey from './useDBSingleKey'
//import {parseImportText} from './utils'
//import localforage from 'localforage'
//import {NewFileButtons, FileSelector, FilesList} from './Components'

export default function JSONTextEditor(props) {
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
