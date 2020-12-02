//, Modal
import React, {useState, useEffect, useContext} from 'react';
import {ListGroup, Button, Accordion, Card, AccordionContext} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import localforage from 'localforage'
import useImportMergeFunctions from './useImportMergeFunctions'
import useImportFunctions from './useImportFunctions'
import {useHistory} from 'react-router-dom'


function ContextAwareToggle({ children, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );
  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <>
    {!isCurrentEventKey && <Button
      onClick={decoratedOnClick}
    >+</Button>
    }
    
    {isCurrentEventKey && <Button
      onClick={decoratedOnClick}
    >-</Button>
    }
    
    </>
  );
}

function ImportReviewPage(props) {
    const {mergeEntities, mergeIntents, mergeUtterances, mergeRegexps, mergeSkill} = useImportMergeFunctions()
    const [skillTitle, setSkillTitle] = useState('')
    const history = useHistory()
  
    const [collatedIntents, setCollatedIntents] = useState({})
    const [collatedEntities, setCollatedEntities] = useState({})
    const [importData, setImportData] = useState({})
    var localforageStorageImport = localforage.createInstance({
        name: 'nlutool',
        storeName   :'importing',
    });
    useEffect(() => {
        localforageStorageImport.getItem('alldata').then(function(importData) {
             console.log('importData')  
             console.log(importData)  
             setImportData(importData)
             if (importData.title) setSkillTitle(importData.title)
             if (importData.intents) {
                 var collatedIntents = {}
                 importData.intents.map(function(intent) {
                     if (intent) {
                         var key = intent.intent ? intent.intent : '_'
                         collatedIntents[key] = collatedIntents[key] ? collatedIntents[key] : []
                         collatedIntents[key].push(intent)
                    }
                    return null
                 })
                 setCollatedIntents(collatedIntents)
             }
             if (importData.entities) {
                 var collatedEntities = {}
                 importData.entities.map(function(entity,index) {
                     if (entity && entity.tags  && entity.tags.length > 0) {
                         entity.tags.map(function(tag) {
                             collatedEntities[tag]  = collatedEntities[tag] ? collatedEntities[tag] : []
                             collatedEntities[tag].push(index)
                         })
                     } else {
                         collatedEntities["untagged"] = collatedEntities["untagged"] ? collatedEntities["untagged"] : []
                         collatedEntities["untagged"].push(index)
                     }
                     return null
                 })
                 setCollatedEntities(collatedEntities)
             }
        })
    },[])
    const blockStyle={borderTop: '2px solid black', minHeight:'5em'}
    const [visible, setVisible] = useState({})
    //<pre>{JSON.stringify(importData,null,2)}</pre>
    
    function importAll() {
        var messages=[]
        mergeIntents(importData.intents , skillTitle).then(function(counts) {
            if (counts.updated > 0 || counts.created > 0) messages.push('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0) + ' intents. ')
            
            mergeEntities(importData.entities, skillTitle).then(function(counts) {
                if (counts.updated > 0 || counts.created > 0) messages.push('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0) + ' entities. ') 
                
                mergeUtterances(importData.utterances, skillTitle).then(function(counts) {
                    if (counts.updated > 0 || counts.created > 0) messages.push('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0)+ ' responses. ')
                    
                    //mergeRegexps(importData.regexpsData, skillTitle).then(function(counts) {
                        //if (counts.updated > 0 || counts.created > 0) messages.push('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0)+ ' regular expressions. ')
                        mergeSkill(importData, skillTitle).then(function() {
                            props.setPageMessage(messages.join('\n'),8000)
                            if (skillTitle && importData.intents && Object.keys(importData.intents).length > 0) {
                                setTimeout(function() {
                                    history.push("/skills/skill/"+skillTitle)
                                },500)
                            }
                            
                        })
                    //})
                })
                
                
            })
        })
            
            
    }
    
        
    return <div style={{marginLeft:'1em'}}>
        <h3>Import Review </h3>
            {skillTitle && <Button style={{float:'right'}} onClick={importAll} variant="success" >Import</Button>}
            {!skillTitle && <Button style={{float:'right'}}  variant="secondary" >Import</Button>}
            <label>Skill <input type='text' value={skillTitle} onChange={function(e) {setSkillTitle(e.target.value)}} /></label>
          <Accordion >

           {/* INTENTS */}
              {importData.intents && <Card>
                <Card.Header>
                  <ContextAwareToggle as={Button} variant="link" eventKey="root-0"  >
                  </ContextAwareToggle>
                  {importData.intents && <span style={{marginLeft:'2em'}}  id='intents' >{Object.keys(collatedIntents).length } intents with {importData.intents ? Object.keys(importData.intents).length : 0} examples </span>}
                </Card.Header>
                
                {<Accordion.Collapse eventKey="root-0"><Card.Body>{Object.keys(collatedIntents).map(function(intent, key) {
                    return <Card key={key}>
                        <Accordion >
                                 
                            <Card.Header>
                               <ContextAwareToggle as={Button} variant="link" eventKey={"intent-"+key}  >
                                    </ContextAwareToggle>&nbsp;&nbsp;
                                    
                              <b>{intent}</b> with {collatedIntents[intent].length} examples
                              
                            </Card.Header>
                            {<Accordion.Collapse eventKey={"intent-"+key}>
                            <Card.Body>
                                   
                                        <ul>{collatedIntents[intent].map(function(example,iikey) {
                                            return <li key={iikey}>{example.example}</li> 
                                        })}</ul>
                                    
                            </Card.Body>
                            </Accordion.Collapse>}
                        </Accordion >
                    </Card>
                          
                    
                })}
                </Card.Body></Accordion.Collapse>}
                
              </Card>}
              
              
                             
  
              
              {/* ENTITIES */}
              {importData.entities && <Card>
                <Card.Header>
                  <ContextAwareToggle as={Button} variant="link" eventKey="root-1"  >
                  </ContextAwareToggle>
                  {importData.entities && <span style={{marginLeft:'2em'}}  id='entities' >{importData.entities ? Object.keys(importData.entities).length : 0} entities </span>}
                </Card.Header>
                
                {<Accordion.Collapse eventKey="root-1"><Card.Body>{Object.keys(collatedEntities).map(function(entityKey, key) {
                    return <Card key={key}>
                        <Accordion >
                            <Card.Header>
                               <ContextAwareToggle as={Button} variant="link" eventKey={"entity-"+key}  >
                               </ContextAwareToggle>&nbsp;&nbsp; {entityKey} 
                                    
                              {/*<b>{entity}</b> with {Object.values(importData.entities[entity].values).length} examples*/}
                             
                            </Card.Header>
                            {<Accordion.Collapse eventKey={"entity-"+key}>
                                <Card.Body>
                                    <ul>{collatedEntities[entityKey] && collatedEntities[entityKey].map(function(example,ikey) {
                                        return <li key={ikey}>{importData && importData.entities[example] && importData.entities[example].value ? importData.entities[example].value : ''}{importData && importData.entities[example] && importData.entities[example].synonym && importData.entities[example].synonym.trim() ? <b>{'       (' + importData.entities[example].synonym + ')'}</b> : ''}</li> 
                                    })}</ul>
                                </Card.Body>
                            </Accordion.Collapse>}
                        </Accordion >
                    </Card>
                          
                    
                })}
                </Card.Body></Accordion.Collapse>}
                
              </Card>}
              
              
              


           {/* UTTERANCES */}
              {importData.utterances && <Card>
                <Card.Header>
                  <ContextAwareToggle as={Button} variant="link" eventKey="root-2"  >
                  </ContextAwareToggle>
                  {importData.utterances && <span style={{marginLeft:'2em'}}  id='utterances' >{importData.utterances ? Object.keys(importData.utterances).length : 0} utterances </span>}
                </Card.Header>
                
                {<Accordion.Collapse eventKey="root-2"><Card.Body>{importData.utterances &&  Object.values(importData.utterances).map(function(utterance, key) {
                    return <Card key={key}>
                                 
                            <Card.Header>
                              <b>{utterance.value}</b> 
                              
                            </Card.Header>
                           <div>
                                {utterance.synonym && utterance.synonym.split("\n").map(function(alt,p) {
                                   return <div key={p}>{alt}</div>
                                })}
                           </div>
                    </Card>
                          
                    
                })}
                </Card.Body></Accordion.Collapse>}
                
              </Card>   }     
              
              
              
              
              
                   
        </Accordion>    
        
    </div>   
}

export default ImportReviewPage


