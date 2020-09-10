/* global window */
import {Link} from 'react-router-dom'
import {Button, ListGroup } from 'react-bootstrap'
import ImportListsDropDown from './ImportListsDropDown'

import React, {Fragment} from 'react';
import FileReaderInput from 'react-file-reader-input';

import TagAllDropDown from './TagAllDropDown'
import IntentAllDropDown from './IntentAllDropDown'
import SkillAllDropDown from './SkillAllDropDown'


import helpSVG from '../images/helpoverview.svg'

function MatchesTallies(props) {
    return <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{props.filteredItems.length}/{props.items.length} matches </span>
}

function HelpMenu(props) {
    return <div>
        <Link style={{marginRight:'1em'}} to="/help" ><Button>Home</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpimport" ><Button>Import</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpexport" ><Button>Export</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpabout" ><Button>About</Button></Link>
    </div>
}

function HelpText(props) { 
    return <div style={{marginLeft:'0.5em'}}>
        <HelpMenu/>
        <h1>NLU tool</h1>
        <img src={helpSVG} style={{width: '80%', height:'15em' }} alt="Help Overview"/>
<br/><br/>        
        <div>This tool helps voice developers build vocabularies for their applications by providing <b>import and export of various NLU training data formats</b>, and a <b>searchable database of community submitted, open licensed skills.</b>
        </div>

       <hr/>
       <p><Link to="/search" ><Button>Search </Button></Link> the community database of NLU example records.</p>
         <p><Link to="/sources" ><Button>Sources</Button></Link> to edit and import skills, pasted text or uploaded files.</p>
        <p><Link to="/examples" ><Button>Organise</Button></Link> your examples using tags and cleanup untagged examples.</p>
        <p><Link to="/skills" ><Button>Skills</Button></Link> to add platform metadata for export in various training formats or publishing to the community database.</p>
        
        <hr/>
        <h3>Features</h3>
        <ul>
            <li>Search for open licenced training data submitted by the community</li>
            <li>Import training data from text files, RASA , JOVO (Alexa, Google), Mycroft and native JSON.</li>
            <li>Edit training data and tag entities in intent examples</li>
            <li>Filtering, tagging, multiple selection and bulk operations to quickly collect training data into an exportable skill</li>
            <li>Virtual rendering with react-window is used to allow fast rendering of lists of intents and entities with many thousands of values</li>
            <li>Export training data suitable for RASA, JOVO and Mycroft</li>
            <li>Publish your skill to the community repository under an open source license</li>
            
        </ul>
        <ul>
            <li>This tool is a Progressive Web Application. Most features work without the Internet.</li>
            <li>MIT Open Source licensed code at <a target="_new" href="https://github.com/syntithenai/opennludata" >Github</a></li>
            <li>Cross platform nodejs server</li>
            <li>Published skills are committed to Github to ensure long term availability of collected data.</li>
            <li>To ensure ongoing availability, the web pages are hosted with github pages and the search interface relies on static data generated during publishing so a database/backend server is only required when publishing)</li>
        </ul>
        
        
        
        <div>When the Internet is available, <b>this site uses Google Analytics to measure engagement and improve future versions.</b></div>
        
        
    </div>
}

function HelpTextImport(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>Importing Data</h1>
            <div>This tool can import files a variety of file formats and allows you to cherry pick intents, entities and utterances.
            <br/>
            You can use zip files to to upload and import many files that make up a skill for Mycroft, RASA or JOVO 
            <br/>
           <ul>
                <li><h3>Text</h3>
                    
                </li>
                <li><h3>JSON</h3>
                
                </li>
                <li><h3>OpenNlu JSON</h3>
                
                </li>
                <li><h3>RASA</h3>
                
                </li>
                <li><h3>JOVO</h3>
                
                </li>
                <li><h3>Mycroft</h3>
                
                </li>

            </ul>
            
            </div>
            <hr/>
        </div>
}

function HelpTextAbout(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>About</h1>
<br/>
            <div><h3>Bugs/Feedback</h3>Please share any feedback on the <a target="_new" href="https://github.com/syntithenai/opennludata/issues" >Github Issues Page</a></div>
            <br/>
             <div>The <a target="_new" href="https://github.com/syntithenai/opennludata" >source code</a> for this tool is available under an MIT Open Source Licence. </div>
            <hr/>
            
             <div>Icons from  The Noun Project and others.</div>
             <ul>
             <li>Man Singing by Gan Khoon Lay from  <a href='https://thenounproject.com/term/man-singing/642288/' target="_new" >The Noun Project</a></li>
             <li>Head by hunotika from <a href='https://thenounproject.com/term/head/184237/' target="_new" >The Noun Project</a></li>
             </ul>
             <hr/>
              <div>Using many open source libraries including</div>
                <ul>
                <li><a target="_new" href="https://www.npmjs.com/package/create-node-app" >create-node-app</a> </li>
                <li><a target="_new" href="https://github.com/syntithenai/react-express-oauth-login-system" >react-express-oauth-login-system</a> for oauth based login with support for social providers</li>
                <li><a target="_new" href="https://github.com/localForage/localForage" >localForage</a> for cross platform local persistence.</li>
                <li><a target="_new" href="https://github.com/florianholzapfel/express-restify-mongoose" >express-restify-mongoose</a> to simplify API development.</li>
                <li><a target="_new" href="https://github.com/bvaughn/react-window" >react-window</a> for virtual rendering, allowing for lists with many thousands of elements.</li>
                <li><a target="_new" href="https://github.com/josdejong/jsoneditor" >JSON editor</a> for editing uploaded sources.</li>
                <li>react, bootstrap, express, mongodb and mongoose</li>
                </ul>
            <hr/>
        </div>
}

function HelpTextExport(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>Exporting</h1>
            <div>This tool can currently export to a number of formats including
            <ul>
                <li>Native JSON format</li>
                <li>Mycroft intents and entities for Padatious NLU</li>
                <li>RASA training data</li>
                <li>JOVO model files</li>
            </ul>
            </div>

        </div>
}


function NewFileButtons(props) {
    return <span>
        <Link to={props.match.url + '/text'} style={{float:'right'}} ><Button>Paste Text</Button></Link>
        <FileSelector {...props}/>   
    </span>
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

export { MatchesTallies,  HelpTextImport,HelpTextExport,HelpTextAbout,HelpText, NewFileButtons, ListsList, FileSelector, WithSelectedDropDowns}
