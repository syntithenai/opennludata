import React from 'react';
import {useState} from 'react';
import {BrowserRouter as  Router, Route, Link  } from 'react-router-dom'
import LocalStorageUploadManager from './LocalStorageUploadManager'
import ListsManager from './ListsManager'
import UtterancesManager from './UtterancesManager'
import NluExampleEditor from './NluExampleEditor'
import NavbarComponent from './components/NavbarComponent'
import {HelpText, HelpTextImport, HelpTextExport, HelpTextAbout} from './components/Components'
import NluImportEditor from './NluImportEditor'
import NluSkillsEditor from './NluSkillsEditor'
import SearchPage from './SearchPage'
import {Button} from 'react-bootstrap'
import localforage from 'localforage'
const gaTrackingCode = 'UA-3712973-4'



//import images from './images'
//console.log(images)
//const axios = require('axios');
  //axios.get('https://github.com/syntithenai/opennludata/wiki/test-skill')
  //.then(function (response) {
    //// handle success
    //console.log(response);
  //})
  //.catch(function (error) {
    //// handle error
    //console.log(error);
  //})
//

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
    const [pageMessage, setPageMessage] = useState('')  
    
    //const [importFrom, setImportFrom] = useState(null)
    // example summaries
    const [intentLookups, setIntentLookups] = useState([])
    const [entityLookups, setEntityLookups] = useState([])
    const [tagLookups, setTagLookups] = useState([])
    const [skillLookups, setSkillLookups] = useState([])
    const [listsLookups, setListsLookups]= useState([])
    const [selectedTally, setSelectedTally] = useState(0)
    const [utterancesLookups, setUtterancesLookups] = useState([])
    const [utteranceListsLookups, setUtteranceListsLookups] = useState([])
    const [utteranceTagsLookups, setUtteranceTagsLookups] = useState([])
    
    // list summaries
    const [listTally, setListTally] = useState(0)
    const [selectedListTally, setSelectedListTally] = useState(0)
    const [listTallyByList, setListTallyByList] = useState({})
    const [selectedListTallyByList, setSelectedListTallyByList] = useState({})
    
    // search bar
    //https://github.com/search?q=repo:syntithenai/opennludata&type=Wikis
    const [skillFilterValue, setSkillFilterValue] = useState('')
  

    
    function startWaiting() {
        setWaiting(true)
    }
    
    function stopWaiting() {
        setTimeout(function() {
            setWaiting(false)
        },300)
    }

    function updateUtterances() {
        console.log('UPDATE UTTERANCES')
        var utteranceStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "utterances",
         });
         utteranceStorage.getItem('alldata', function (err,utterances) {
                var utteranceLists={}
                var utteranceIndex={}
                var utteranceTags={}
                //console.log(['UPDATE UTTERANCES',err,utterances])
                if (Array.isArray(utterances)) {
                    utterances.map(function(utterance,i) {
                        console.log(['UPDATE UTTERANCE',utterance])
                         if (utterance.value) {
                             utteranceIndex[utterance.value]=true
                         }
                         if (utterance.synonym) {
                             utterance.synonym.split("\n").map(function(tag) {
                                 utteranceLists[tag] = true
                                 return null
                             })
                         } 
                         if (utterance.tags && utterance.tags.length > 0) {
                               utterance.tags.map(function(tag) {
                                  utteranceTags[tag] = true  
                                  return null
                               })
                         }
                         return null
                    })
                    setUtterancesLookups(Object.keys(utteranceIndex))
                    setUtteranceTagsLookups(Object.keys(utteranceTags))
                    setUtteranceListsLookups(Object.keys(utteranceLists))
                }
                console.log(['UPDATE UTTERANCES',utteranceIndex,utteranceLists])
                    
              });
            //});
  
    }

    function updateLists(lists) {
        if (lists) {
            var newSelectedLists = {}
            var newLists = {}
            var tally = 0;
             var selectedTally = 0;
            lists.map(function(listItem) {
                if (listItem && listItem.tags && listItem.tags.length > 0) {
                    if (listItem.isSelected) {
                             selectedTally += 1
                    }
                    listItem.tags.map(function(tag) {
                        if (tag && tag.trim().length > 0) {
                            if (listItem.isSelected) {
                                 newLists[tag] = (newLists[tag] > 0) ? newLists[tag] + 1 : 1
                                 newSelectedLists[tag] = (newSelectedLists[tag] > 0) ? newSelectedLists[tag] + 1 : 1
                            } else {
                                newLists[tag] = (newLists[tag] >0) ? newLists[tag] + 1 : 1
                            }
                        }
                        return null
                    })
                    tally += 1;
                }
                return null
            })
            setListTally(tally)
            setSelectedListTally(selectedTally)
            setSelectedListTallyByList(newSelectedLists)
            setListTallyByList(newLists)
            setListsLookups(Object.keys(newLists))
            //console.log('updated lists', newLists)
        }
    }

    function updateLookups(items) {
        //console.log(['UPDATELOOKUPS',items])
        if (items && items.length > 0) {
            var tags = {}
            var intents = {}
            var entities = {}
            var skills = {}
            var selected = 0;
            items.map(function(item) {
                if (item) {
                    if (item.isSelected) selected = selected + 1;
                   intents[item.intent] = true
                   if (item.tags && item.tags.length > 0) {
                       item.tags.map(function(tag) {
                          tags[tag] = true  
                          return null
                       })
                   }
                   if (item.skills && item.skills.length > 0) {
                       item.skills.map(function(skill) {
                          skills[skill] = true  
                          return null
                       })
                   }
                   if (item.entities && item.entities.length > 0) {
                       item.entities.map(function(entity) {
                          if (entity.type) {
                              entities[entity.type] = true  
                          }
                          return null
                       })
                   }
                }
               return null
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
    const lookups = {utteranceTagsLookups:utteranceTagsLookups,utterancesLookups:utterancesLookups,utteranceListsLookups:utteranceListsLookups,intentLookups,entityLookups,tagLookups,skillLookups, selectedTally, listsLookups, listTally, selectedListTally, listTallyByList, selectedListTallyByList}
    const updateFunctions = {updateLookups, updateLists, updateUtterances}
  return (
    <div className="OpenNluDataApp">
           
        <Router>
                <Route exact path='*' render={
                    (props) => {
                        return <NavbarComponent waiting={waiting} history={props.history} message={pageMessage} setPageMessage={setPageMessage}    />
                    }}
                />
                
                <Route exact path='/menu' component={SiteMenu} />
                <Route path='/sources' render={
                    (props) => <LocalStorageUploadManager {...props}  startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions} lookups={lookups}  />
                }/>
                <Route exact path='/import' render={
                    (props) => <NluImportEditor {...props}        lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />}
                          
                />
                
                <Route exact path='/import/skill/:skillId' render={
                    (props) => <NluImportEditor {...props}        lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />}
                          
                />
                
                <Route exact path='/import/intent/:intentId' render={
                    (props) => <NluImportEditor {...props}        lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions} setPageMessage={setPageMessage}    />}
                          
                />
                
                <Route path='/import/skill/:skillId/intent/:intentId' render={
                    (props) => <NluImportEditor {...props}        lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions} setPageMessage={setPageMessage}    />}
                          
                />
                
                
                <Route exact  path='/examples' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />
                
                <Route exact path='/examples/skill/:skillId' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />
                
                <Route path='/examples/intent/:intentId' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />
                
                <Route exact path='/examples/skill/:skillId/intent/:intentId' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />
                
                <Route exact path='/skills/:skillId' render={(props) => <NluSkillsEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />
                
                <Route exact path='/skills/skill/:skillId' render={(props) => <NluSkillsEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />

                 <Route exact path='/skills' render={(props) => <NluSkillsEditor {...props} skillFilterValue={skillFilterValue} setSkillFilterValue={setSkillFilterValue}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                />
                
               
                <Route exact path='/lists' render={
                    (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />}
                          
                />
                <Route exact path='/lists/:listId' render={
                    (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                          
                />
                
                
                <Route exact path='/utterances' render={
                    (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                          
                />
                <Route exact path='/utterances/:listId' render={
                    (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                          
                />
                
                
                <Route exact path='/help' component={HelpText}     />
                <Route exact path='/helpimport' component={HelpTextImport}     />
                <Route exact path='/helpexport' component={HelpTextExport}     />
                <Route exact path='/helpabout' component={HelpTextAbout}     />
                
                 <Route exact path='/search' component={SearchPage}     />
                <Route exact path='/' component={HelpText} />
        </Router>
    </div>
  );
}
                
export default App;
