import React from 'react';
import {useState} from 'react';
import {BrowserRouter as  Router, Route, Link  } from 'react-router-dom'
import LocalStorageUploadManager from './LocalStorageUploadManager'
import NluExampleEditor from './NluExampleEditor'
import NavbarComponent from './NavbarComponent'
import {HelpText} from './Components'
import NluImportEditor from './NluImportEditor'
import NluSkillsEditor from './NluSkillsEditor'
import {Nav,  Button} from 'react-bootstrap'

function SiteMenu(props) {
    var astyle={paddingLeft:'0.3em'}
    return <div style={{marginLeft:'0.5em'}}>
            <h1>Menu</h1>
            
                <Link style={astyle} to="/sources" ><Button>Sources</Button></Link>
                <Link style={astyle} to="/import" ><Button>Import</Button></Link>
                <Link style={astyle} to="/examples" ><Button>Organise</Button></Link>
                <Link style={astyle} to="/skills" ><Button>Skills </Button></Link>
                <Link style={astyle} to="/search" ><Button>Search Community </Button></Link>
                
        </div>
}

function App() {
    
    const [waiting, setWaiting] = useState(false)
    const [importFrom, setImportFrom] = useState(null)
    const [importNluFrom, setImportNluFrom] = useState(null)
    const [intentLookups, setIntentLookups] = useState([])
    const [entityLookups, setEntityLookups] = useState([])
    const [tagLookups, setTagLookups] = useState([])
    const [skillLookups, setSkillLookups] = useState([])
    const [selectedTally, setSelectedTally] = useState(0)
    const [pageTitle, setPageTitle] = useState('NLU Toolsddd')  
    const [pageMessage, setPageMessage] = useState('')  
    
    function startWaiting() {
        setWaiting(true)
    }
    
    function stopWaiting() {
        setTimeout(function() {
            setWaiting(false)
        },300)
    }
    
    function fileSelected(source) {
        setImportFrom(source)
    }
    
    function saveNluItems(items) {
        console.log(['SAVE NLU',items])
        setImportNluFrom(items)
    }
    function updateLookups(items) {
        console.log(['UPDATELOOKUPS',items])
        if (items && items.length > 0) {
            var tags = {}
            var intents = {}
            var entities = {}
            var skills = {}
            var selected = 0;
            items.map(function(item) {
                if (item.isSelected) selected = selected + 1;
               intents[item.intent] = true
               if (item.tags && item.tags.length > 0) {
                   item.tags.map(function(tag) {
                      tags[tag] = true  
                   })
               }
               if (item.skills && item.skills.length > 0) {
                   item.skills.map(function(skill) {
                      skills[skill] = true  
                   })
               }
               if (item.entities && item.entities.length > 0) {
                   item.entities.map(function(entity) {
                      if (entity.type) {
                          entities[entity.type] = true  
                      }
                   })
               }
            })
            const distinct = function(value,index,self) {
                return self.indexOf(value) === index;
            }
            setIntentLookups([].concat(Object.keys(intents),intentLookups).filter(distinct))
            setEntityLookups([].concat(Object.keys(entities),entityLookups).filter(distinct))
            setTagLookups([].concat(Object.keys(tags),tagLookups).filter(distinct))
            setSkillLookups([].concat(Object.keys(skills),skillLookups).filter(distinct))
            setSelectedTally(selected)
        }
    }
    const lookups = {intentLookups,entityLookups,tagLookups,skillLookups, selectedTally}
  return (
    <div className="OpenNluDataApp">
        <Router>
                <Route exact path='*' render={
                    (props) => {
                        return <NavbarComponent waiting={waiting} history={props.history} />
                    }}
                />
                
                <Route exact path='/menu' component={SiteMenu}  title={pageTitle} message={pageMessage}   />
                <Route path='/sources' render={
                    (props) => <LocalStorageUploadManager {...props} setPageTitle={setPageTitle} startWaiting={startWaiting} stopWaiting={stopWaiting} fileSelected={fileSelected}  setPageMessage={setPageMessage}    />
                }/>
                <Route path='/import' render={
                    (props) => <NluImportEditor {...props}  setPageTitle={setPageTitle}  saveNluItems={saveNluItems}  importFrom={importFrom} setImportFrom={setImportFrom} lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateLookups={updateLookups}  setPageMessage={setPageMessage}    />}
                          
                />
                
                <Route path='/examples' render={(props) => <NluExampleEditor {...props} setPageTitle={setPageTitle}  importFrom={importFrom} setImportFrom={setImportFrom} lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateLookups={updateLookups}  setPageMessage={setPageMessage}    />} 
                />
                
                <Route path='/skills/:skillId' render={(props) => <NluSkillsEditor {...props} setPageTitle={setPageTitle}  importFrom={importFrom} setImportFrom={setImportFrom} lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateLookups={updateLookups}  setPageMessage={setPageMessage}    />} 
                />

                 <Route path='/skills' render={(props) => <NluSkillsEditor {...props} setPageTitle={setPageTitle}  importFrom={importFrom} setImportFrom={setImportFrom} lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateLookups={updateLookups}  setPageMessage={setPageMessage}    />} 
                />
                
                
                <Route exact path='/help' component={HelpText} setPageTitle={setPageTitle}    />
                <Route exact path='/' component={HelpText} />
        </Router>
    </div>
  );
}
                
export default App;
