import React, {useState, useEffect} from 'react';
import {Button, ListGroup, Form, Row, Col, Container} from 'react-bootstrap'
import { Link , useHistory } from 'react-router-dom'
import useRestEndpoint from './useRestEndpoint'
import Autosuggest from 'react-autosuggest'
import useImportFunctions from './useImportFunctions'
import useDB from './useDB'
    
export default function SkillSearchPage(props) {
    const [searchFilter, setSearchFilter] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const token = props.user && props.user.token && props.user.token.access_token ? props.user.token.access_token : ''
    const axiosClient = props.getAxiosClient(token)
    const {saveItem, deleteItem, getItem, searchItems} = useRestEndpoint(axiosClient,process.env.REACT_APP_restPublicBaseUrl)
    var importFunctions = useImportFunctions()
    var history = useHistory() 
    var [skills, setSkills] = useState({})
    var [tags, setTags] = useState({})
    const sourcesDB = useDB('nlutool','sources');

    //useEffect((props) => {
        //loadSkills()
        ////doSearch()
    //},[])
    
    useEffect((props) => {
        doSearch()
    },[props.lookups.skills])
    
    function loadSkill(skill) {
        console.log(['LOaD SKIL',skill])  
        return new Promise(function(resolve,reject) {
            if (skill && skill.file) {
                console.log(['LOaD SKIL have file',(process.env.REACT_APP_githubSkillsUrl ? process.env.REACT_APP_githubSkillsUrl : '/static/media/skills/')+skill.file])  
                const axiosClient = props.getAxiosClient()
                axiosClient.get((process.env.REACT_APP_githubSkillsUrl ? process.env.REACT_APP_githubSkillsUrl : '/static/media/skills/')+skill.file).then(function(res) {
                  console.log(['LOaDed SKIL',res.data])  
                  if (res.data) {
                      //console.log(res.data)
                      //try {
                          //var data = JSON.parse(res.data)
                          resolve({fileType:'opennlu.skill', created_date: new Date().getTime(), title: res.data.title, data: JSON.stringify(res.data)})
                      //} catch (e) {
                        //console.log(e)      
                    //}
                  } else {
                      reject('Failed to load skill')  
                  }
                }).catch(function(e) {
                   reject('Failed to load skill')  
                })
            } else {
                reject('Incomplete skill data')
            }
        })
    }
    
    //function loadSkills() {
        //const axiosClient = props.getAxiosClient()
        //axiosClient.get((process.env.REACT_APP_githubSkillsUrl ? process.env.REACT_APP_githubSkillsUrl : '/static/media/skills/')+'index.js').then(function(res) {
          //console.log(['LOaD SKILSS',res.data])  
          //var tags={}
          //if (res.data) {
              //Object.values(res.data).map(function(skill) {
                  //if (skill.tags) skill.tags.map(function(tag) {
                      //tags[tag] = true
                     //return null  
                  //})
                  //return null
              //})
              //setTags(Object.keys(tags).sort())
              //setSkills(res.data)
          //}
        //}).catch(function(err) {
            //console.log(err)  
        //})
    //}
    
    function importItem(skill) {
        console.log(['import item',skill])  
        loadSkill(skill).then(function(item) {
            console.log(['imported item',item])  
            //var item = {id:null, data:JSON.stringify(item), title:item.title+'.skill.json', fileType :"opennlu.skill    "}
            sourcesDB.saveItem(item,0)
            history.push("/sources")
        }).catch(function(e) {
           console.log(e)   
        })
    }

    function doSearch(queryIn='') {
        const text = queryIn && queryIn.trim && queryIn.trim() ? queryIn : (searchFilter && searchFilter.trim() ? searchFilter : '')
        if (props.lookups.skills) {
            if (text) {
                var filtered = []
                Object.values(props.lookups.skills).map(function(skill) {
                    if (skill.userAvatar && skill.userAvatar.indexOf(text) !== -1) {
                        filtered.push(skill)
                    } else if (skill.title && skill.title.indexOf(text) !== -1) {
                        filtered.push(skill)
                    } else if (skill.tags && skill.tags.indexOf(text) !== -1) {
                        filtered.push(skill)
                    }
                    return null
                })
                setSearchResults(filtered)
            } else {
                setSearchResults(Object.values(props.lookups.skills))
            }
        }
        //var query = {}
        //var sort = {title: 1}
        //if (text && text.trim()) {
            ////query.title=searchFilter
            //query["$text"]={"$search":text.trim()}
        //} else {
            //sort = {updated_date : -1}
        //}
        //searchItems('Skill',query, 40, 0, sort).then(function(res) {
              //console.log('doSerach')
              //console.log(res.data)
              //setSearchResults(res.data)
        //})
    }
      

    // Use your imagination to render suggestions.
    const renderSuggestion = suggestion => (
        <div>
        {suggestion.tag}
        </div>
    );
    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    function onSuggestionsFetchRequested ({ value }) {
         setSuggestions(props.lookups.tags.sort().map(function(tag) {
             return {tag: tag} 
          }))
        
        //searchItems('SkillTags',{tag:{"$regex":value}},20,0,'',{tag:1}).then(function(res) {
            //setSuggestions(res.data && res.data.length > 0 ? res.data : [])
        //})
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    function  onSuggestionsClearRequested()  {
       setSuggestions([]);
    };

    function setSearchFilterWrap(text) {
        setSearchFilter(text)
        //loadSuggestions(text)
    } 
    
   
    return <div style={{marginLeft:'1em'}}>
         <Form onSubmit={function(e) {e.preventDefault(); doSearch()}} >
            <Row><Col>
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                    renderSuggestion={renderSuggestion}
                    onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                        setSearchFilter(suggestionValue)
                        doSearch(suggestionValue)
                    }}
                    inputProps={{
                        style:{width:'100%'},
                      value: searchFilter,
                      onChange: function(e) {setSearchFilter(e.target.value)}
                    }}
                />
                </Col><Col>
                <Button variant="success" onClick={doSearch}>Search</Button>
                <Button variant="danger" onClick={function() {setSearchFilter(''); doSearch('')}}>Reset</Button>
            </Col></Row>
        </Form> 
        
        {!searchFilter.trim() && <h3>Recent Skills</h3>}
        {searchFilter.trim() && <h3>Search Results</h3>}
        <Container fluid ><Row>
        {searchResults.map(function(result, key) {
            const bStyle = {marginLeft:'0.5em', marginBottom:'0.2em'}
             return <Col sm={12} md={6} lg={4} xl={4} key={key} style={{border: '2px solid black', padding: '0.5em', margin: '0.5em'}}>
                <Button variant="success" style={{float:'right'}} onClick={function(e) {importItem(result)}}>Grab</Button>
                <h4 style={{marginBottom:'0.3em'}} >{result.title} {result.userAvatar && <span>by {result.userAvatar}</span>} </h4>
                
                {result.tags && result.tags.length > 0 && <Button style={bStyle} variant="outline-warning" >{result.tags.join(", ")}</Button>}
                <div>
                    {result.intents && result.intents > 0 && <Button variant="outline-primary"style={bStyle}>{result.intents} intents </Button>}
                    {result.entities && result.entities > 0 && <Button variant="outline-primary"style={bStyle}>{result.entities} entities</Button>}
                    {(result.regexps > 0) && <Button variant="outline-primary"style={bStyle}>{result.regexps} regular expressions</Button>}
                    {(result.utterances > 0 )&& <Button variant="outline-primary"style={bStyle}>{result.utterances} utterances</Button>}
                    {<Button style={{marginLeft:'0.5em', marginTop:'1em'}} variant="outline-secondary" >Updated: {new Date(result.updated_date).toUTCString()}</Button>}
                </div>
             </Col>
        })}
        </Row></Container>       
    </div>
    
    
}

