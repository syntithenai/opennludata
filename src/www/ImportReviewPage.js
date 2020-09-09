//, Modal
import React, {useState, useEffect, useContext} from 'react';
import {ListGroup, Button, Accordion, Card, AccordionContext} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import localforage from 'localforage'
import useImportMergeFunctions from './useImportMergeFunctions'
import useImportFunctions from './useImportFunctions'



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
    const {mergeEntities, mergeIntents, mergeUtterances} = useImportMergeFunctions()
    const [skillTitle, setSkillTitle] = useState('')
    
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
                     var key = intent.intent ? intent.intent : '_'
                     collatedIntents[key] = collatedIntents[key] ? collatedIntents[key] : []
                     collatedIntents[key].push(intent)
                    return null
                 })
                 setCollatedIntents(collatedIntents)
             }
             if (importData.entities) {
                 var collatedEntities = {}
                 importData.entities.map(function(entity,index) {
                     if (entity.tags  && entity.tags.length > 0) {
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
        
    return <div style={{marginLeft:'1em'}}>
        <h3>Import Review</h3>
        
          <Accordion >

           {/* INTENTS */}
              {importData.intents && <Card>
                <Card.Header>
                  <ContextAwareToggle as={Button} variant="link" eventKey="root-0"  >
                  </ContextAwareToggle>
                  {importData.intents && <span style={{marginLeft:'2em'}}  id='intents' >{Object.keys(collatedIntents).length } intents with {importData.intents ? Object.keys(importData.intents).length : 0} examples <Button 
                    style={{marginLeft:'2em'}} 
                    onClick={function(e) {
                                    mergeIntents(importData.intents , skillTitle)
                                    .then(function(counts) {
                                        props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                                        // TODO remove item from import data
                                    })
                                }}>Import All Intents</Button></span>}
                </Card.Header>
                
                {<Accordion.Collapse eventKey="root-0"><Card.Body>{Object.keys(collatedIntents).map(function(intent, key) {
                    return <Card key={key}>
                        <Accordion >
                                 
                            <Card.Header>
                               <ContextAwareToggle as={Button} variant="link" eventKey={"intent-"+key}  >
                                    </ContextAwareToggle>&nbsp;&nbsp;
                                    
                              <b>{intent}</b> with {collatedIntents[intent].length} examples
                              <Button 
                                style={{marginLeft:'2em'}} 
                                onClick={function(e) {
                                    mergeIntents(collatedIntents[intent], skillTitle)
                                    .then(function(counts) {
                                        props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                                        // TODO remove item from import data
                                    })
                                }}>Import {intent}</Button>
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
                  {importData.entities && <span style={{marginLeft:'2em'}}  id='entities' >{importData.entities ? Object.keys(importData.entities).length : 0} entities <Button 
                    style={{marginLeft:'2em'}} 
                    onClick={function(e) {
                        mergeEntities(importData.entities, skillTitle)
                        .then(function(counts) {
                            props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                        })
                    }}>Import All Entities</Button></span>}
                </Card.Header>
                {<Accordion.Collapse eventKey="root-1"><Card.Body>{Object.keys(collatedEntities).map(function(entityKey, key) {
                    return <Card key={key}>
                        <Accordion >
                            <Card.Header>
                               <ContextAwareToggle as={Button} variant="link" eventKey={"entity-"+key}  >
                                </ContextAwareToggle>&nbsp;&nbsp;
                                    
                              {/*<b>{entity}</b> with {Object.values(importData.entities[entity].values).length} examples*/}
                              <Button 
                                style={{marginLeft:'2em'}} 
                                onClick={function(e) {
                                    mergeEntities(collatedEntities[entityKey].map(function(i) {return importData.entities[i]}), skillTitle)
                                    .then(function(counts) {
                                        props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                                    })
                                }}>Import {entityKey}</Button>
                            </Card.Header>
                            {<Accordion.Collapse eventKey={"entity-"+key}>
                                <Card.Body>
                                    <ul>{collatedEntities[entityKey] && collatedEntities[entityKey].map(function(example,ikey) {
                                        return <li key={ikey}>{importData.entities[example].value}</li> 
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
                  {importData.utterances && <span style={{marginLeft:'2em'}}  id='utterances' >{importData.utterances ? Object.keys(importData.utterances).length : 0} utterances <Button 
                    style={{marginLeft:'2em'}} 
                    onClick={function(e) {
                        mergeUtterances(importData.utterances, skillTitle)
                        .then(function(counts) {
                            props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                        })
                    }}>Import All Utterances</Button></span>}
                </Card.Header>
                
                {<Accordion.Collapse eventKey="root-2"><Card.Body>{importData.utterances &&  Object.values(importData.utterances).map(function(utterance, key) {
                    return <Card key={key}>
                                 
                            <Card.Header>
                              <b>{utterance.value}</b> 
                              <Button 
                                style={{marginLeft:'2em'}} 
                                onClick={function(e) {
                                    mergeUtterances([utterance], skillTitle)
                                    .then(function(counts) {
                                        props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                                    })
                                }}>Import</Button>
                            </Card.Header>
                           
                    </Card>
                          
                    
                })}
                </Card.Body></Accordion.Collapse>}
                
              </Card>   }           
        </Accordion>    
        
    </div>   
}

export default ImportReviewPage





                   
         //<div id='skill' ><label>Title <input type='text' value={skillTitle} onChange={function(e) {setSkillTitle(e.target.value)}} />        &nbsp;&nbsp;<Button 
            //onClick={function(e) {
                ////mergeIntents([importData.utterances[utterance]], skillTitle)
                ////.then(function(intentCounts) {
                    //////props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                ////})
            //}}>Import All</Button>
            //</label></div>
       
        //<Accordion >
         
              
            //{/* UTTERANCES */}
              //<Card>
                //<Card.Header>
                  //<ContextAwareToggle as={Button} variant="link" eventKey="root-2"  >
                  //</ContextAwareToggle>
                  //{importData.utterances && <span style={{marginLeft:'2em'}}  id='intents' >{importData.utterances ? Object.keys(importData.utterances).length : 0} utterances <Button 
                    //style={{marginLeft:'2em'}} 
                    //onClick={function(e) {
                        //mergeUtterances(importData.utterances, skillTitle)
                        //.then(function(counts) {
                            //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                        //})
                    //}}>Import All Utterances</Button></span>}
                //</Card.Header>
                
                //{<Accordion.Collapse eventKey="root-2"><Card.Body>{importData.utterances &&  Object.keys(importData.utterances).map(function(utterance, key) {
                    //return <Card>
                        //<Accordion >
                                 
                            //<Card.Header>
                               //<ContextAwareToggle as={Button} variant="link" eventKey={"utterance-"+key}  >
                                //</ContextAwareToggle>&nbsp;&nbsp;
                                    
                              //<b>{utterance}</b> with {importData.utterances[utterance].length} examples
                              //<Button 
                                //style={{marginLeft:'2em'}} 
                                //onClick={function(e) {
                                    //mergeIntents([importData.utterances[utterance]], skillTitle)
                                    //.then(function(counts) {
                                        //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                                    //})
                                //}}>Import {utterance}</Button>
                            //</Card.Header>
                            //{<Accordion.Collapse eventKey={"utterance-"+key}>
                                //<Card.Body>
                                        //<ul>{Object.keys(importData.utterances[utterance]).map(function(example) {
                                            //return <li>{example.example}</li> 
                                        //})}</ul>
                                //</Card.Body>
                            //</Accordion.Collapse>}
                        //</Accordion >
                    //</Card>
                          
                    
                //})}
                //</Card.Body></Accordion.Collapse>}
                
              //</Card>              
        //</Accordion>
















 //<Card>
                //<Card.Header>
                  //<Accordion.Toggle as={Button} variant="link" eventKey="1">
                      //<Button>+</Button>
                  //</Accordion.Toggle>
                  //{importData.entities && <span style={{marginLeft:'2em'}} id='entities' >{importData.entities ? Object.keys(importData.entities).length : 0} entities<Button 
                        //style={{marginLeft:'2em'}} 
                        //onClick={function(e) {
                            //mergeEntities(importData.entities, skillTitle)
                            //.then(function(counts) {
                                //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                            //})
                        //}}>Import</Button></span>}
                //</Card.Header>
                //<Accordion.Collapse eventKey="1">
                  //<Card.Body></Card.Body>
                //</Accordion.Collapse>
              //</Card>
              
              //<Card>
                //<Card.Header>
                  //<Accordion.Toggle as={Button} variant="link" eventKey="1">
                      //<Button>+</Button>
                  //</Accordion.Toggle>
                  //{importData.utterances && <div style={blockStyle} id='utterances' >{importData.utterances ? importData.utterances.length : 0} utterances<Button 
                    //style={{marginLeft:'2em'}} 
                    //onClick={function(e) {
                        //mergeUtterances(importData.utterances, skillTitle)
                        //.then(function(counts) {
                            //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                        //})
                    //}}>Import</Button></div>}
                //</Card.Header>
                //<Accordion.Collapse eventKey="1">
                  //<Card.Body>Hello! I'm another body</Card.Body>
                //</Accordion.Collapse>
              //</Card>
              


    //var intentAccordionPanels = []
            
    //if (importData.intents) {
        //Object.keys(importData.intents).map(function(intent, key) {
            ////importData.intents[intent].map(function(example) {
                 //intentAccordionPanels.push({
                     //title:intent, 
                     //content:<div>{importData.intents[intent] && importData.intents[intent].map(function(example,ikey) {
                            //return <div key={ikey}>{example.example}</div> 
                        //})}</div>,
                      //key:"intent-"+key
                 //}) 
                 //return null
            ////})
            //return null
        //})
    //}
    
    
    //const AccordionPanels = [
      //{ 
            //title: (importData.intents ? Object.keys(importData.intents).length : 0)+' intents ', 
            //content:  { content:<div>
                    //{<>
                        //<Button 
                            //style={{marginLeft:'2em'}} 
                            //onClick={function(e) {
                                //mergeIntents(importData.intents, skillTitle)
                                //.then(function(counts) {
                                    //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                                //})
                            //}}>Import All Intents
                        //</Button>
                        //<Accordion.Accordion
                          //className="padding"
                          //panels={intentAccordionPanels}
                        ///>
                    //</>}
                    //</div>}, 
            //key: 'sub-accordions'
      //},
                    
      //{ title: (importData.entities ? Object.keys(importData.entities).length : 0)+' entities ', content: { content: <b>ddd<Button 
                        //style={{marginLeft:'2em'}} 
                        //onClick={function(e) {
                            //mergeEntities(importData.entities, skillTitle)
                            //.then(function(counts) {
                                //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                            //})
                        //}}>Import</Button></b>, key: 'sub-accordions' } },
      //{ title: (importData.utterances ? Object.keys(importData.utterances).length : 0)+' utterances ', content: { content: <b>ddd<Button 
                    //style={{marginLeft:'2em'}} 
                    //onClick={function(e) {
                        //mergeUtterances(importData.utterances, skillTitle)
                        //.then(function(counts) {
                            //props.setPageMessage('Updated '+(counts.updated ? counts.updated : 0) +' and created '+(counts.created ? counts.created : 0),4000)
                        //})
                    //}}>Import</Button></b>, key: 'sub-accordions' } },
    //]

//<Accordion
         //className="padding"
            //defaultActiveIndex={null}
            //panels={AccordionPanels}
          ///>
        


//import { Accordion } from 'semantic-ui-react';
//import 'semantic-ui-css/semantic.min.css

//const AccordionContent = (content) => (
  //<div className="indent">
    //{content}
  //</div>
//)

//const SubAccordion1Panels = [
  //{
    //title: 'Sub Accordion 11',
    //content: { content: AccordionContent('11 Content'), key: '11-content'} ,
    //key: 'sub-accordion-11'
  //}, {
    //title: 'Sub Accordion 12',
    //content: { content: AccordionContent('12 Contents'), key: '12-content' },
    //key: 'sub-accordion-12'
  //}, {
    //title: 'Sub Accordion 13',
    //content: { content: AccordionContent('13 Contents'), key: '13-content' },
    //key: 'sub-accordion-13'
  //},
//]

//const SubAccordion1Content = (
  //<div className="indent">
    //<Accordion.Accordion
      //style={{marginLeft: "20px"}}
      //className="no-padding"
      //panels={SubAccordion1Panels}
    ///>
  //</div>
//)

//const SubAccordionPanels = [
  //{
    //title: 'Sub Accordion 1',
    //content: { content: SubAccordion1Content, key: 'sa1-content' },
    //key: 'sub-accordion-1'
  //}, {
    //title: 'Sub Accordion 2',
    //content: { content: AccordionContent('SA2 Content'), key: 'sa2-content' },
    //key: 'sub-accordion-2'
  //}, {
    //title: 'Sub Accordion 3',
    //content: { content: AccordionContent('SA3 Content'), key: 'sa3-content' },
    //key: 'sub-accordion-3'
  //}
//]

//const SubAccordions = (
  //<div className="indent">
    //<Accordion.Accordion
      //className="no-padding"
      //panels={SubAccordionPanels}
    ///>
  //</div>
//)

//const AccordionPanels = [
  //{ title: 'Accordion', content: { content: SubAccordions, key: 'sub-accordions' } },
//]

    
