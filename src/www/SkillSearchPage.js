import React, {useState, useEffect} from 'react';
import {Button, ListGroup, Form, Row, Col} from 'react-bootstrap'
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
        doSearch()
    },[])
    
    function importItem(item) {
        item.fileType = "skill.json"
        var item = {id:null, data:JSON.stringify(item), title:item.title+'.skill.json', fileType :"skill.json"}
        sourcesDB.saveItem(item,0)
        history.push("/sources")
    }
    
    
    function doSearch(query='') {
        const text = query && query.trim() ? query : (searchFilter && searchFilter.trim() ? searchFilter : '')
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
    
   
    return <div>
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
        <ListGroup>
        {searchResults.map(function(result, key) {
             return <ListGroup.Item key={key}>
                <Button variant="success" style={{float:'right'}} onClick={function(e) {importItem(result)}}>Grab</Button>
                <h4>{result.title}</h4>
                <ul>
                    {result.tags && result.tags.length > 0 && <li>{result.tags.length} tags - {result.tags.join(", ")}</li>}
                    {result.intents && result.intents.length > 0 && <li>{result.intents.length} intents</li>}
                    {result.entities && result.entities.length > 0 && <li>{result.entities.length} entities</li>}
                    {result.regexps && result.regexps.length > 0 && <li>{result.regexps.length} regular expressions</li>}
                    {result.utterances && result.utterances.length > 0 && <li>{result.utterances.length} utterances</li>}
                    {<li>Updated: {new Date(result.updated_date).toUTCString()}</li>}
                </ul>
             </ListGroup.Item>
        })}
        </ListGroup>       
    </div>
    
    
}

