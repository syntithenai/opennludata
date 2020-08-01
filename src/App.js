/* global window */
import React from 'react';
import {Button, Navbar, ListGroup,  Dropdown, ButtonGroup } from 'react-bootstrap'
import {Component} from 'react';
import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom'
import LocalStorageUploadManager from './LocalStorageUploadManager'
import NluExampleEditor from './NluExampleEditor'
import NavbarComponent from './NavbarComponent'
import {HelpText} from './Components'

function HomePage(props) {
   return <Link to="/sources" >Sources</Link>   
}


function App() {
    
    const [waiting, setWaiting] = useState(false)
    const [importFrom, setImportFrom] = useState(null)
    const [intentLookups, setIntentLookups] = useState(['ask_date','read_news','play_music'])
    const [entityLookups, setEntityLookups] = useState(['date','song_filter','artist','topic'])
        
    function startWaiting() {
        setWaiting(true)
    }
    
    function stopWaiting() {
        let that = this;
        setTimeout(function() {
            setWaiting(false)
        },300)
    }
    
    function fileSelected(source) {
        console.log(['SEL SROUC',source , unescape(source.data)])
        
            setImportFrom(source)
        //}
    }
    
    function saveNluItem(item) {
        console.log(['SAVE NLU',item])
        
          //  setImportFrom(source)
        //}
    }
    
  return (
    <div className="OpenNluDataApp">
        <Router>
                <NavbarComponent waiting={waiting} />
                <Route path='/sources' render={
                    (props) => <LocalStorageUploadManager {...props} startWaiting={startWaiting} stopWaiting={stopWaiting} fileSelected={fileSelected} intentLookups={intentLookups} setIntentLookups={setIntentLookups} entityLookups={entityLookups} setEntityLookups={setEntityLookups} />
                }/>
                <Route path='/import' render={(props) => <NluExampleEditor {...props} saveNluItem={saveNluItem}  importFrom={importFrom} intentLookups={intentLookups} setIntentLookups={setIntentLookups} entityLookups={entityLookups} setEntityLookups={setEntityLookups}   startWaiting={startWaiting} stopWaiting={stopWaiting}  />}      />
                <Route exact path='/help' component={HelpText}     />
                <Route exact path='/' component={HelpText} />
        </Router>
    </div>
  );
}
                
export default App;
