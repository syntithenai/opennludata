import React from 'react';
import {useState, useEffect} from 'react';
import {HashRouter as  Router, Route, Link  } from 'react-router-dom'
import LocalStorageUploadManager from './LocalStorageUploadManager'
import ListsManager from './ListsManager'
import UtterancesManager from './UtterancesManager'
import RegexpsManager from './RegexpsManager'
import ApisManager from './ApisManager'
import ActionsManager from './ActionsManager'
import FormsManager from './FormsManager'


import NluExampleEditor from './NluExampleEditor'
import NavbarComponent from './components/NavbarComponent'
//import TestComponent from './components/TestComponent'
import {HelpText, HelpTextImport, HelpTextExport, HelpTextAbout, HelpTextTips} from './components/Components'
import NluImportEditor from './NluImportEditor'
import NluSkillsEditor from './NluSkillsEditor'
//import SearchPage from './SearchPage'
import ImportReviewPage from './ImportReviewPage'
import SkillSearchPage from './SkillSearchPage'
import ChatPage from './ChatPage'
import SkillSettingsPage from './SkillSettingsPage'

import {Button} from 'react-bootstrap'
import localforage from 'localforage'
import {ExternalLogin}  from 'react-express-oauth-login-system-components'
//import RulesEditor from './RulesEditor'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const axios = require('axios');

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
    const [pageMessage, setPageMessageInner] = useState('')  
    var messageTimeout = null
    const [isBigScreen,setIsBigScreen] = useState(false)
    
    // TODO - FINISH REFINE ONCHANGE TRIGGERS
    const [isChanged,setIsChanged] = useState(false)
    
    function setPageMessage(message,timeout=0) {
        setPageMessageInner(message)
        if (timeout > 0) {
            if (messageTimeout) clearTimeout(messageTimeout) 
            messageTimeout = setTimeout(function() {setPageMessage('')},timeout)
        }
    }
    
    useEffect(() => {
       //console.log(['SIZE',window.innerWidth])
       if (window.innerWidth > 800) setIsBigScreen(true) 
    })
     useEffect(() => {
        updateUtterances()
        updateRegexps()
        updateLookups()
        updateActions()
        updateApis()
        updateForms()
        //updateUtterances()
        //updateActions()
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
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
    const [regexpsLookups, setRegexpsLookups] = useState([])
    const [regexpsCompleteLookups, setRegexpsCompleteLookups] = useState([])
    const [regexpListsLookups, setRegexpListsLookups] = useState([])
    const [regexpTagsLookups, setRegexpTagsLookups] = useState([])
    
    // list summaries
    const [listTally, setListTally] = useState(0)
    const [selectedListTally, setSelectedListTally] = useState(0)
    const [listTallyByList, setListTallyByList] = useState({})
    const [selectedListTallyByList, setSelectedListTallyByList] = useState({})
    
    const [regexTally, setRegexTally] = useState(0)
    const [selectedRegexTally, setSelectedRegexTally] = useState(0)
    const [utteranceTally, setUtteranceTally] = useState(0)
    const [selectedUtteranceTally, setSelectedUtteranceTally] = useState(0)
    var [skills, setSkills] = useState({})
    var [skillTags, setSkillTags] = useState({})
    
    
    // actions
    const [actionTally, setActionTally] = useState(0)
    const [selectedActionTally, setSelectedActionTally] = useState(0)
    const [actionsLookups, setActionsLookups] = useState([])
    const [actionsCompleteLookups, setActionsCompleteLookups] = useState([])
    const [actionListsLookups, setActionListsLookups] = useState([])
    const [actionTagsLookups, setActionTagsLookups] = useState([])
    
    // forms
    const [formTally, setFormTally] = useState(0)
    const [selectedFormTally, setSelectedFormTally] = useState(0)
    const [formsLookups, setFormsLookups] = useState([])
    const [formsCompleteLookups, setFormsCompleteLookups] = useState([])
    const [formListsLookups, setFormListsLookups] = useState([])
    const [formTagsLookups, setFormTagsLookups] = useState([])
    
    
    // apis
    const [apiTally, setApiTally] = useState(0)
    const [selectedApiTally, setSelectedApiTally] = useState(0)
    const [apisLookups, setApisLookups] = useState([])
    const [apisCompleteLookups, setApisCompleteLookups] = useState([])
    const [apiListsLookups, setApiListsLookups] = useState([])
    const [apiTagsLookups, setApiTagsLookups] = useState([])
    
    // search bar
   // const [skillFilterValue, setSkillFilterValue] = useState('')
  
    
    
    function loadSkills() {
        return axios.get( '/static/skills/' +'index.js?no_cache=1&t='+parseInt(Math.random() * 1000000000000)).then(function(res) {
          console.log(['LOaD SKILSS githubskill',res.data])  
          var tags={}
          if (res.data) {
              Object.values(res.data).map(function(skill) {
                  if (skill.tags) skill.tags.map(function(tag) {
                      tags[tag] = true
                     return null  
                  })
                  return null
              })
              setSkillTags(Object.keys(tags).sort())
              setSkills(res.data)
          }
        }).catch(function(err) {
            //console.log(err)  
        })
    }
       
    useEffect(() => {loadSkills()},[])   
       
    function startWaiting() {
        setWaiting(true)
    }
    
    function stopWaiting() {
        setTimeout(function() {
            setWaiting(false)
        },300)
    }




    function updateApis() {
        //console.log('UPDATE apis')
        var storage = localforage.createInstance({
           name: "nlutool",
           storeName   : "apis",
         });
         storage.getItem('alldata', function (err,utterances) {
                 var tally = 0;
                 var selectedTally = 0;
                //var utteranceLists={}
                var utteranceIndex={}
                var utteranceCompleteIndex={}
                var utteranceTags={}
                ////console.log(['UPDATE UTTERANCES',err,utterances])
                if (Array.isArray(utterances)) {
                    utterances.map(function(utterance,i) {
                        ////console.log(['UPDATE regexp',utterance])
                         if (utterance.isSelected) {
                             selectedTally += 1
                        }
                        tally += 1;
                         if (utterance.value) {
                             utteranceIndex[utterance.value]=true
                             utteranceCompleteIndex[utterance.value]={value: utterance.value, synonym: utterance.synonym}
                         }
                         //if (utterance.synonym) {
                             //utterance.synonym.split("\n").map(function(synonym) {
                                 //utteranceLists[synonym] = true
                                 //return null
                             //})
                         //} 
                         if (utterance.tags && utterance.tags.length > 0) {
                               utterance.tags.map(function(tag) {
                                  utteranceTags[tag] = true  
                                  return null
                               })
                         }
                         return null
                    })
                    setApiTally(tally)
                    setSelectedApiTally(selectedTally)
                    setApisLookups(Object.keys(utteranceIndex))
                    setApisCompleteLookups(Object.values(utteranceCompleteIndex))
                    setApiTagsLookups(Object.keys(utteranceTags))
                    //setApiListsLookups(Object.keys(utteranceLists))
                }
                //console.log(['UPDATED APIS',utteranceIndex])
                    
              });
            //});
  
    }
    
    
    
    function updateActions() {
        //console.log('UPDATE actions')
        var storage = localforage.createInstance({
           name: "nlutool",
           storeName   : "actions",
         });
         storage.getItem('alldata', function (err,utterances) {
                 var tally = 0;
                 var selectedTally = 0;
                var utteranceLists={}
                var utteranceIndex={}
                var utteranceCompleteIndex={}
                var utteranceTags={}
                ////console.log(['UPDATE UTTERANCES',err,utterances])
                if (Array.isArray(utterances)) {
                    utterances.map(function(utterance,i) {
                        ////console.log(['UPDATE regexp',utterance])
                         if (utterance.isSelected) {
                             selectedTally += 1
                        }
                        tally += 1;
                         if (utterance.value) {
                             utteranceIndex[utterance.value]=true
                             utteranceCompleteIndex[utterance.value]={value: utterance.value, synonym: utterance.synonym}
                         }
                         if (utterance.synonym) {
                             utterance.synonym.split("\n").map(function(synonym) {
                                 utteranceLists[synonym] = true
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
                    setActionTally(tally)
                    setSelectedActionTally(selectedTally)
                    setActionsLookups(Object.keys(utteranceIndex))
                    setActionsCompleteLookups(Object.values(utteranceCompleteIndex))
                    setActionTagsLookups(Object.keys(utteranceTags))
                    setActionListsLookups(Object.keys(utteranceLists))
                }
                //console.log(['UPDATEd actions',utteranceIndex,utteranceLists])
                    
              });
            //});
  
    }
    
      
    
    function updateForms() {
        //console.log('UPDATE forms')
        var storage = localforage.createInstance({
           name: "nlutool",
           storeName   : "forms",
         });
         storage.getItem('alldata', function (err,utterances) {
                 var tally = 0;
                 var selectedTally = 0;
                var utteranceLists={}
                var utteranceIndex={}
                var utteranceCompleteIndex={}
                var utteranceTags={}
                ////console.log(['UPDATE UTTERANCES',err,utterances])
                if (Array.isArray(utterances)) {
                    utterances.map(function(utterance,i) {
                        ////console.log(['UPDATE regexp',utterance])
                         if (utterance.isSelected) {
                             selectedTally += 1
                        }
                        tally += 1;
                         if (utterance.value) {
                             utteranceIndex[utterance.value]=true
                             utteranceCompleteIndex[utterance.value]={value: utterance.value, synonym: utterance.synonym}
                         }
                         
                         if (utterance.tags && utterance.tags.length > 0) {
                               utterance.tags.map(function(tag) {
                                  utteranceTags[tag] = true  
                                  return null
                               })
                         }
                         return null
                    })
                    setFormTally(tally)
                    setSelectedFormTally(selectedTally)
                    setFormsLookups(Object.keys(utteranceIndex))
                    setFormsCompleteLookups(Object.values(utteranceCompleteIndex))
                    setFormTagsLookups(Object.keys(utteranceTags))
                    setFormListsLookups(Object.keys(utteranceLists))
                }
                //console.log(['UPDATE forms',utteranceIndex,utteranceLists])
                    
              });
            //});
  
    }
    
    function updateRegexps() {
        //console.log('UPDATE regexps')
        var storage = localforage.createInstance({
           name: "nlutool",
           storeName   : "regexps",
         });
         storage.getItem('alldata', function (err,utterances) {
                 var tally = 0;
                 var selectedTally = 0;
                var utteranceLists={}
                var utteranceIndex={}
                var utteranceCompleteIndex={}
                var utteranceTags={}
                ////console.log(['UPDATE UTTERANCES',err,utterances])
                if (Array.isArray(utterances)) {
                    utterances.map(function(utterance,i) {
                        ////console.log(['UPDATE regexp',utterance])
                         if (utterance.isSelected) {
                             selectedTally += 1
                        }
                        tally += 1;
                         if (utterance.value) {
                             utteranceIndex[utterance.value]=true
                             utteranceCompleteIndex[utterance.value]={value: utterance.value, synonym: utterance.synonym}
                         }
                         if (utterance.synonym) {
                             utterance.synonym.split("\n").map(function(synonym) {
                                 utteranceLists[synonym] = true
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
                    setRegexTally(tally)
                    setSelectedRegexTally(selectedTally)
                    setRegexpsLookups(Object.keys(utteranceIndex))
                    setRegexpsCompleteLookups(Object.values(utteranceCompleteIndex))
                    setRegexpTagsLookups(Object.keys(utteranceTags))
                    setRegexpListsLookups(Object.keys(utteranceLists))
                }
                //console.log(['UPDATE regexps',utteranceIndex,utteranceLists])
                    
              });
            //});
  
    }
    
    function updateUtterances() {
        //console.log('UPDATE UTTERANCES')
        var utteranceStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "utterances",
         });
         var tally = 0;
         var selectedTally = 0;
         utteranceStorage.getItem('alldata', function (err,utterances) {
                var utteranceLists={}
                var utteranceIndex={}
                var utteranceTags={}
                //console.log(['UPDATE UTTERANCES',err,utterances])
                if (Array.isArray(utterances)) {
                    utterances.map(function(utterance,i) {
                        if (utterance.isSelected) {
                             selectedTally += 1
                        }
                        tally += 1;
                        ////console.log(['UPDATE UTTERANCE',utterance])
                         if (utterance.value) {
                             utteranceIndex[utterance.value]=true
                         }
                         var synonym = utterance.synonym ? utterance.synonym : ''
                         if (synonym) {
                             synonym.split("\n").map(function(synonymKey) {
                                 utteranceLists[synonymKey] = true
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
                    setUtteranceTally(tally)
                    setSelectedUtteranceTally(selectedTally)
                    setUtterancesLookups(Object.keys(utteranceIndex))
                    setUtteranceTagsLookups(Object.keys(utteranceTags))
                    setUtteranceListsLookups(Object.keys(utteranceLists))
                }
                //console.log(['UPDATEd UTTERANCES',utteranceIndex,utteranceLists])
                    
              });
            //});
  
    }

    /*
     * Using all entities, collate lookups for 
     * - various lists tallies (selected, selected by tag)
     * - lookups - all distinct values
     */
    function updateLists() {
        var listsStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "lists",
         });
         //console.log(['UPDATELISTS'])
         listsStorage.getItem('alldata', function (err,lists) {
            ////console.log(['UPDATELISTS',lists])
            if (lists) {
                var newSelectedLists = {}
                var newLists = {}
                var tally = 0;
                var selectedTally = 0;
                lists.map(function(listItem) {
                    if (listItem.isSelected) {
                             selectedTally += 1
                    }
                    tally += 1;
                    if (listItem && listItem.tags && listItem.tags.length > 0) {
                        
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
                    }
                    return null
                })
                ////console.log(['UPDATELISTS',tally, selectedTally])
                setListTally(tally)
                setSelectedListTally(selectedTally)
                setSelectedListTallyByList(newSelectedLists)
                setListTallyByList(newLists)
                setListsLookups(Object.keys(newLists))
                //console.log('updated lists', newLists)
            }
        })
    }

    /*
     * Using all intents, collate lookups for 
     * - intents,entities, tags, skills
     * - selectedTally (intents)
     */
    function updateLookups() {
        //console.log(['UPDATELOOKUPS'])
        var examplesStorage = localforage.createInstance({
           name: "nlutool",
           storeName   : "examples",
         });
        examplesStorage.getItem('alldata', function (err,items) {
            ////console.log(['UPDATELOOKUPS',items])
            if (items && items.length > 0) {
                var tags = {}
                var intents = {}
                var entities = {}
                var skills = {}
                var selected = 0;
                items.map(function(item) {
                    if (item) {
                        ////console.log(['UPDATELOOKUPS single',item])
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
                ////
                    
                setIntentLookups([].concat(Object.keys(intents),intentLookups).filter(distinct))
                setEntityLookups([].concat(Object.keys(entities),entityLookups).filter(distinct))
                setTagLookups([].concat(Object.keys(tags),tagLookups).filter(distinct))
                setSkillLookups([].concat(Object.keys(skills),skillLookups).filter(distinct))
                setSelectedTally(selected)
                ////console.log(entityLookups, intentLookups)
                //console.log(['UPDATEd LOOKUPS single res',intents,entities])
            }
        })
    }
    const lookups = {isChanged, isBigScreen, actionTally, selectedActionTally,actionsLookups, actionsCompleteLookups, actionListsLookups, actionTagsLookups,
        formTally, selectedFormTally,formsLookups, formsCompleteLookups, formListsLookups, formTagsLookups,
        apiTally, selectedApiTally,apisLookups, apisCompleteLookups, apiListsLookups, apiTagsLookups,
        regexpTagsLookups:regexpTagsLookups,regexpsLookups:regexpsLookups,regexpListsLookups:regexpListsLookups,  regexpsCompleteLookups,  utteranceTagsLookups:utteranceTagsLookups,utterancesLookups:utterancesLookups,utteranceListsLookups:utteranceListsLookups,intentLookups,entityLookups,tagLookups,skillLookups, selectedTally, listsLookups, listTally, selectedListTally, listTallyByList, selectedListTallyByList, utteranceTally, selectedUtteranceTally,regexTally, selectedRegexTally, skills, skillTags}
    const updateFunctions = {setIsChanged, updateLookups, updateLists, updateUtterances, updateRegexps, updateActions, updateApis, updateForms, loadSkills}
          //console.log(['LOOKUPS',lookups])      
  return (
    <div className="OpenNluDataApp">
         <ExternalLogin  
                authServer={process.env.REACT_APP_authServer} 
                authServerHostname={process.env.REACT_APP_authServerHostname} 
                 authWeb="" 
            >{(user,setUser,getAxiosClient,getMediaQueryString,getCsrfQueryString, isLoggedIn, loadUser, doLogout, doLogin, doProfile,  authServer, authServerHostname) => {  
                
                return <div  >
                <Router  basename='/'>
                      
                
                        <Route exact path='*' render={
                            (props) => {
                                return <NavbarComponent waiting={waiting} user={user} doLogin={doLogin} doLogout={doLogout} doProfile={doProfile} isLoggedIn={isLoggedIn} history={props.history} message={pageMessage} setPageMessage={setPageMessage}  getAxiosClient={getAxiosClient}  />
                            }}
                        />
                        <div style={{marginLeft:'0.5em'}} >
                            
                            <Route exact path='/menu' component={SiteMenu} />
                            <Route path='/sources' render={
                                (props) => <LocalStorageUploadManager {...props} startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions} lookups={lookups}  />
                            }/>
                            
                            
                            <Route path='/importreview' render={
                                (props) => <ImportReviewPage {...props} startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions} lookups={lookups}  />
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
                            
                            <Route path='/examples/tag/:tag' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                            />
                            
                            <Route exact path='/examples/skill/:skillId/intent/:intentId' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                            />
                            
                            <Route exact path='/examples/skill/:skillId/tag/:tag' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                            />
                            
                            <Route exact path='/examples/intent/:intentId/tag/:tag' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                            />
                            
                            <Route exact path='/examples/skill/:skillId/intent/:intentId/tag/:tag' render={(props) => <NluExampleEditor {...props}     lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />} 
                            />
                            
                            <Route exact path='/skills/:skillId' render={(props) => <NluSkillsEditor {...props}  doLogin={doLogin}  user={user}   lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   getAxiosClient={getAxiosClient}  />} 
                            />
                            
                            <Route exact path='/skills/skill/:skillId' render={(props) => <NluSkillsEditor {...props}  doLogin={doLogin}  user={user}   lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   getAxiosClient={getAxiosClient}  />} 
                            />
                            
                            <Route exact path='/skills/:skillId/publish' render={(props) => <NluSkillsEditor {...props} doLogin={doLogin}  user={user}    lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}  publish={true}   getAxiosClient={getAxiosClient} />} 
                            />
                            
                            <Route exact path='/skills/skill/:skillId/publish' render={(props) => <NluSkillsEditor {...props} doLogin={doLogin}   user={user}   lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   publish={true}  getAxiosClient={getAxiosClient} />} 
                            />
                            
                            <Route exact path='/skills/:skillId/chat' render={(props) => <ChatPage {...props} isFullScreen={true} doLogin={doLogin}  user={user}    lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}  publish={true}   getAxiosClient={getAxiosClient} />} 
                            />
                            
                            <Route exact path='/skills/skill/:skillId/chat' render={(props) => <ChatPage {...props}  isFullScreen={true}  doLogin={doLogin}   user={user}   lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   publish={true}  getAxiosClient={getAxiosClient} />} 
                            />
                            
                            <Route exact path='/skills/:skillId/settings' render={(props) => <SkillSettingsPage {...props} lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  getAxiosClient={getAxiosClient} />} 
                            />
                            
                            <Route exact path='/skills/skill/:skillId/settings' render={(props) => <SkillSettingsPage {...props} lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  getAxiosClient={getAxiosClient} />} 
                            />

                             <Route exact path='/skills' render={(props) => <NluSkillsEditor {...props} doLogin={doLogin} user={user}      lookups={lookups}  startWaiting={startWaiting} stopWaiting={stopWaiting} updateFunctions={updateFunctions}  setPageMessage={setPageMessage} getAxiosClient={getAxiosClient}   />} 
                            />
                            
                           
                            <Route exact path='/lists' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />}
                                      
                            />
                            <Route exact path='/lists/list/:listId' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                                      
                            />
                            <Route exact path='/lists/filter/:filter' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                                      
                            />
                            <Route exact path='/lists/list/:listId/filter/:filter' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                                      
                            />
                            <Route exact path='/lists/fromskill/:fromskill' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}    />}
                                      
                            />
                            <Route exact path='/lists/list/:listId/fromskill/:fromskill' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                                      
                            />
                            <Route exact path='/lists/filter/:filter/fromskill/:fromskill' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                                      
                            />
                            <Route exact path='/lists/list/:listId/filter/:filter/fromskill/:fromskill' render={
                                (props) => <ListsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}  updateFunctions={updateFunctions}  setPageMessage={setPageMessage}   />}
                                      
                            />
                            
                            
                            
                            <Route exact path='/utterances' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/filter/:filter' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/filter/:filter' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/fromskill/:fromskill' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/fromskill/:fromskill' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/filter/:filter/fromskill/:fromskill' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/filter/:filter/fromskill/:fromskill' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            <Route exact path='/utterances/list/:listId/fromaction/:fromaction' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/filter/:filter/fromaction/:fromaction' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/filter/:filter/fromaction/:fromaction' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            <Route exact path='/utterances/list/:listId/fromskill/:fromskill/fromaction/:fromaction' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/filter/:filter/fromskill/:fromskill/fromaction/:fromaction' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/filter/:filter/fromskill/:fromskill/fromaction/:fromaction' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            <Route exact path='/utterances/list/:listId/fromform/:fromform' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/filter/:filter/fromform/:fromform' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/filter/:filter/fromform/:fromform' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            <Route exact path='/utterances/list/:listId/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/filter/:filter/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/utterances/list/:listId/filter/:filter/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <UtterancesManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            
                            
                            <Route exact path='/apis' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/apis/fromskill/:fromskill' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/apis/list/:listId' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/filter/:filter' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/list/:listId/filter/:filter' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/list/:listId/fromaction/:fromaction' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/filter/:filter/fromaction/:fromaction' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/list/:listId/filter/:filter/fromaction/:fromaction' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            <Route exact path='/apis/list/:listId/fromaction/fromskill/:fromskill/:fromaction' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/filter/:filter/fromskill/:fromskill/fromaction/:fromaction' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/apis/list/:listId/filter/:filter/fromskill/:fromskill/fromaction/:fromaction' render={
                                (props) => <ApisManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            
                            
                            
                            <Route exact path='/actions' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/actions/list/:listId' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/filter/:filter' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/list/:listId/filter/:filter' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/fromskill/:fromskill' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/list/:listId/fromskill/:fromskill' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/filter/:filter/fromskill/:fromskill' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/filter/:filter/fromform/:fromform' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/list/:listId/filter/:filter/fromskill/:fromskill' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />    
                            
                             <Route exact path='/actions/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/list/:listId/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/filter/:filter/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/actions/list/:listId/filter/:filter/fromskill/:fromskill/fromform/:fromform' render={
                                (props) => <ActionsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />                             
                            
                            
                            
                             
                            
                            <Route exact path='/forms' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/forms/list/:listId' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/forms/filter/:filter' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/forms/list/:listId/filter/:filter' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/forms/fromskill/:fromskill' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/forms/list/:listId/fromskill/:fromskill' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/forms/filter/:filter/fromskill/:fromskill' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />
                            <Route exact path='/forms/list/:listId/filter/:filter/fromskill/:fromskill' render={
                                (props) => <FormsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                                      
                            />                            
                            
                            
                            
                            
                            
                            <Route exact path='/regexps' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/regexps/list/:listId' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                            />
                            <Route exact path='/regexps/filter/:filter' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                            />
                            <Route exact path='/regexps/list/:listId/filter/:filter' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                            />
                            <Route exact path='/regexps/fromskill/:fromskill' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}   />}
                                      
                            />
                            <Route exact path='/regexps/list/:listId/fromskill/:fromskill' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                            />
                            <Route exact path='/regexps/filter/:filter/fromskill/:fromskill' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                            />
                            <Route exact path='/regexps/list/:listId/filter/:filter/fromskill/:fromskill' render={
                                (props) => <RegexpsManager {...props}   lookups={lookups}    startWaiting={startWaiting} stopWaiting={stopWaiting}   setPageMessage={setPageMessage}  updateFunctions={updateFunctions}  />}
                            />
                            
                            
                            
                            <Route exact path='/help' component={HelpText}     />
                            <Route exact path='/helpimport' component={HelpTextImport}     />
                            <Route exact path='/helpexport' component={HelpTextExport}     />
                            <Route exact path='/helpabout' component={HelpTextAbout}     />
                            <Route exact path='/helptips' component={HelpTextTips}     />
                            
                            <Route exact path='/search' render={(props) => <SkillSearchPage user={user} getAxiosClient={getAxiosClient} lookups={lookups} updateFunctions={updateFunctions}  />} />
                           
                            <Route exact path='/' component={HelpText} />

                            
                        </div>
                </Router>
              </div>
                  }}

        </ExternalLogin>
   
                 <br/>
                <br/>
                <br/>
    </div>
  );
}
                
export default App;
//<Route path='/login'  render={
                            //(props) => <div style={{width:'90%', marginLeft:'1em', align:'center', marginTop:'1em'}}  ><LoginSystem  
                               //match={props.match}
                               //location={props.location}
                               //history={props.history}
                               //authServer={process.env.REACT_APP_authServer} 
                                //// also need external link to auth server (combind authServerHostname + authServer) for google, github, .. login buttons
                                //authServerHostname={process.env.REACT_APP_authServerHostname} 
                                //// update for login api location, use package.json proxy config to map other host/port to local link
                               //loginButtons={process.env.REACT_APP_loginButtons?process.env.REACT_APP_loginButtons.split(","):[]}
                                //// optional callbacks
                                //logoutRedirect={'/'}
                               //user={user} setUser={setUser} isLoggedIn={isLoggedIn} logout={logout} saveUser={saveUser} startWaiting={startWaiting} stopWaiting={stopWaiting} 
                             ///></div>}
                             ///>
// <Route exact path='/rule' component={RuleEditor} />
                           
