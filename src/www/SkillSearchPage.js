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
    const {saveItem, deleteItem, getItem, searchItems} = useRestEndpoint(axiosClient,"http://localhost:5000/public/api/v1/")
    var importFunctions = useImportFunctions()
    var history = useHistory() 

    const sourcesDB = useDB('nlutool','sources');

    useEffect((props) => {
        loadSkills()
        //doSearch()
    },[])
    
    function loadSkills() {
        const axiosClient = props.getAxiosClient()
        axiosClient.get((process.env.REACT_APP_githubSkillsUrl ? process.env.REACT_APP_githubSkillsUrl : 'https://opennludata.org/static/media/skills/')+'index.js').then(function(res) {
          console.log(['LOD SKILSS',res])  
        }).catch(function(err) {
            console.log(err)  
        })
        //https://raw.githubusercontent.com/syntithenai/opennludata_data/master/public/skills/index.js
    }
    
    function importItem(item) {
        var item = {id:null, data:JSON.stringify(item), title:item.title+'.skill.json', fileType :"opennlu.skill    "}
        sourcesDB.saveItem(item,0)
        history.push("/sources")
    }

    function doSearch(queryIn='') {
        const text = queryIn && queryIn.trim && queryIn.trim() ? queryIn : (searchFilter && searchFilter.trim() ? searchFilter : '')
        var query = {}
        var sort = {title: 1}
        if (text && text.trim()) {
            //query.title=searchFilter
            query["$text"]={"$search":text.trim()}
        } else {
            sort = {updated_date : -1}
        }
        searchItems('Skill',query, 40, 0, sort).then(function(res) {
              console.log('doSerach')
              console.log(res.data)
              setSearchResults(res.data)
        })
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
        searchItems('SkillTags',{tag:{"$regex":value}},20,0,'',{tag:1}).then(function(res) {
            setSuggestions(res.data && res.data.length > 0 ? res.data : [])
        })
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
            
            </Col></Row>
        </Form> 
        
        {!searchFilter.trim() && <h3>Recent Skills</h3>}
        {searchFilter.trim() && <h3>Search Results</h3>}
        <Container fluid ><Row>
        {searchResults.map(function(result, key) {
            const bStyle = {marginLeft:'0.5em'}
             return <Col sm={12} md={6} lg={4} xl={4} key={key} style={{border: '2px solid black', padding: '0.5em', margin: '0.5em'}}>
                <Button variant="success" style={{float:'right'}} onClick={function(e) {importItem(result)}}>Grab</Button>
                <h4 style={{marginBottom:'0.3em'}} >{result.title} {result.userAvatar && <span>by {result.userAvatar}</span>} </h4>
                
                {result.tags && result.tags.length > 0 && <Button style={bStyle} variant="outline-warning" >{result.tags.join(", ")}</Button>}
                <div>
                    {result.intents && Object.keys(result.intents).length > 0 && <Button variant="outline-primary"style={bStyle}>{Object.keys(result.intents).length} intents </Button>}
                    {result.entities && Object.keys(result.entities).length > 0 && <Button variant="outline-primary"style={bStyle}>{Object.keys(result.entities).length} entities</Button>}
                    {result.regexps && result.regexps.length > 0 && <Button variant="outline-primary"style={bStyle}>{result.regexps.length} regular expressions</Button>}
                    {result.utterances && result.utterances.length > 0 && <Button variant="outline-primary"style={bStyle}>{result.utterances.length} utterances</Button>}
                    {<Button style={{marginLeft:'0.5em', marginTop:'1em'}} variant="outline-secondary" >Updated: {new Date(result.updated_date).toUTCString()}</Button>}
                </div>
             </Col>
        })}
        </Row></Container>       
    </div>
    
    
}

