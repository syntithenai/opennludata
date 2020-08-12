/* global window */
import {Link} from 'react-router-dom'
import {Button, ListGroup } from 'react-bootstrap'
import React, {Fragment} from 'react';
import FileReaderInput from 'react-file-reader-input';

import TagAllDropDown from './TagAllDropDown'
import IntentAllDropDown from './IntentAllDropDown'
import SkillAllDropDown from './SkillAllDropDown'

import ImportListsDropDown from './ImportListsDropDown'

function MatchesTallies(props) {
    return <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{props.filteredItems.length}/{props.items.length} matches </span>
}

function HelpText(props) { 
    return <div style={{marginLeft:'0.5em'}}>
        <h1>NLU tool</h1>
        <div>This tool is intended to help collect open licensed NLU data. </div>
        <div>Specifically, it captures sentences with related intent and entity maps.</div>
        <div>Examples can be tagged for organisation. eg music player, news reader</div>
        <div>Examples can be collected into your own skills for export into various NLU training data formats.</div>
        <hr/>
        <p>Create <Link to="/sources" ><Button>Sources</Button></Link> from pasted text or uploaded files.</p>
        <p>Use the <Link to="/import" ><Button>Import</Button></Link> page to break text into sentences and create NLU example records.</p>
        <p><Link to="/examples" ><Button>Organise</Button></Link> your examples using tags and cleanup untagged examples.</p>
        <p><Link to="/search" ><Button>Search </Button></Link> the community database of NLU example records.</p>
        <p><Link to="/skills" ><Button>Collect </Button></Link> examples into a skill for export in various training formats.</p>
        </div>
}

function NewFileButtons(props) {
    return <span>
        <Link to={props.match.url + '/text'} style={{float:'right'}} ><Button>Paste Text</Button></Link>
        <FileSelector {...props}/>   
    </span>
}

function FilesList(props) {
    //console.log(['man fl ',props])
     const { items} = props  
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {if(window.confirm('Really delete source '+items[i].title)) props.deleteItem(i)}} >Delete</Button>
                   <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importExamples(items[i]) }}    >Import Intents</Button>
                   <ImportListsDropDown lookups={props.lookups} importListTo={function(listName) {props.importLists(items[i],listName)}} importTo={items[i].title} />
                   <span style={{width:'90%'}}  >{item.title}</span>
               </ListGroup.Item>
        })
        return <ListGroup>{list}</ListGroup>
    } else {
        return null
    }
}

function ListsList(props) {
     const { items} = props  
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {if(window.confirm('Really delete list '+items[i].title)) props.deleteItem(i)}} >Delete</Button>
                   <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>
                   <span style={{width:'90%'}}  >{item.title}</span>
               </ListGroup.Item>
        })
        return <ListGroup>{list}</ListGroup>
    } else {
        return null
    }
}

function FileSelector(props) {
    return <form onSubmit={function(e) {e.preventDefault()}} style={{float:'right'}}>
            <FileReaderInput multiple as="binary" id="my-file-input"
                             onChange={props.handleFileSelection}>
              <Button style={{ marginRight:'0.5em'}} >Select files</Button>
            </FileReaderInput>
          </form>
}

function WithSelectedDropDowns(props) {
    return <Fragment>
        <span>With {props.lookups.selectedTally} selected&nbsp;</span>
               
        <SkillAllDropDown skillSetAll={props.skillSetAll} skillAllValue={props.skillAllValue}  setSkillAllValue={props.setSkillAllValue}  lookups={props.lookups} untagAll={props.untagAll} unskillAll={props.unskillAll} />
        <IntentAllDropDown intentAll={props.intentAll} intentAllValue={props.intentAllValue} setIntentAllValue={props.setIntentAllValue}  lookups={props.lookups} untagAll={props.untagAll} unskillAll={props.unskillAll} />
        <TagAllDropDown tagAll={props.tagAll} tagAllValue={props.tagAllValue} setTagAllValue={props.setTagAllValue}  lookups={props.lookups} untagAll={props.untagAll} unskillAll={props.unskillAll} />
    </Fragment>

}

export { MatchesTallies,  HelpText, NewFileButtons, FilesList, ListsList, FileSelector, WithSelectedDropDowns}
