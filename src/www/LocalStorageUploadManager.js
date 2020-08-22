import {Route} from 'react-router-dom'
import React, {useEffect} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useDB from './useDB'
import {parseImportText, parseLists, detectFileType} from './parsers'

import localforage from 'localforage'
import {NewFileButtons} from './components/Components'
import JSONTextEditor from './components/JSONTextEditor'
import {generateObjectId, uniquifyArray } from './utils'
import {Link} from 'react-router-dom'
import {Button, ListGroup } from 'react-bootstrap'
import ImportListsDropDown from './components/ImportListsDropDown'


// COMPONENTS
function IndexPage(props) {
    //console.log(['man index ',props])
    return <div>
                 <NewFileButtons {...props} />
                 <h1>Sources</h1>
                 <FilesList {...props} />
            </div>
}



function FilesList(props) {
    //console.log(['man fl ',props])
     const { items} = props  
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >
                   
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {if(window.confirm('Really delete source '+items[i].title)) props.deleteItem(i)}} >Delete</Button>
                   {/* Can't edit zip files*/}
                   {!item.fileType.endsWith('.zip') && <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>}
                   
                    {/* Only import utterances */}
                   {(item.fileType !== "rasa.md" && item.fileType !== "rasa.json" && item.fileType !== "jovo.lang"  && item.fileType !== "opennlu.regexps"  && item.fileType !== "opennlu.lists") && <Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importFunctions.importUtterances(items[i]) }}    >Import Utterances</Button>}
                   {/* Only import entities */}
                   <ImportListsDropDown lookups={props.lookups} importListTo={function(listName) {props.importFunctions.importEntities(items[i],listName)}} importTo={items[i].title} />
                   {/* Import whatever is available */}
                   {<Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importFunctions.importAll(items[i]) }}    >Import</Button>}
                   
                   <span style={{width:'90%'}}  > {item.fileType && <Button>{item.fileType}</Button>}&nbsp;&nbsp;&nbsp;{item.title}</span>
                  
               </ListGroup.Item>
        })
        return <ListGroup>{list}</ListGroup>
    } else {
        return null
    }
}

export default function LocalStorageUploadManager(props) {
    //console.log('man')
    //console.log(props)
     var localforageStorageImport = localforage.createInstance({
       name: 'nlutool',
       storeName   :'import',
     });
     var localforageStorageLists = localforage.createInstance({
       name: 'nlutool',
       storeName   :'lists',
     });


     const {loadAll, saveItem, deleteItem ,items, findKeyBy, findBy} = useDB('nlutool','sources');
    
    // just on mount 
    useEffect(() => {
        loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    
    
    
    function handleFileSelection(ev, results) {
        ev.preventDefault()
        if (results) {
            results.forEach(result => {
              const [e, file] = result;
              console.log(['upl result',e, file,e.target.result])
               var item = {id:null, data:e.target.result, title:file.name}
               detectFileType(item).then(function(fileData) {
                    if (fileData && fileData.type) {
                        item.fileType = fileData.type
                        console.log(['SET ITEM TYPE', item.fileType])
                        saveItem(item)
                    } else {
                        props.setPageMessage('Invalid file type')
                        setTimeout(function() {
                            props.setPageMessage('')
                        },2000)
                    }
                })
            });
            
        }
    }    
  
    function importExamples(item) {
         //console.log(['import examples',item])
        if (item && item.id && item.data) {
            var parsed = parseImportText(item.data)
            localforageStorageImport.getItem('alldata').then(function(res) {
                //console.log('IMPORT MERGE',res,parsed,[].concat(parsed,res))
                localforageStorageImport.setItem('alldata',[].concat(parsed,res)) 
                props.history.push('/import') 
            })
          } else {
            throw new Error("Missing import data")
        }
    }

    function importEntities(item) {
         //console.log(['import examples',item])
         //if (item && item.fileType  && item.fileType.endsWith('.zip'))  {
             //if (item.fileType === "mycroft.zip") {
                 
             //} else if (item.fileType === "rasa.zip") {
                 
             //} else if (item.fileType === "jovo.zip") {
                 
             //} 
         //} else {
             //if () 
         //}
    }

    function importUtterances(item) {
         //console.log(['import examples',item])
    }
    
    function importAll(item) {
         //console.log(['import examples',item])
    }
    
    function saveItemWrap(item,index) {
        detectFileType(item).then(function(fileData) {
            item.fileType = fileData.type
            console.log(['SET ITEM TYPE', item.fileType])
            saveItem(item,index)
        })
    }
    
    function importLists(item,title) {
        //console.log(['import lists',item,title])
        if (item && item.id && item.data) {
            var parsed = parseLists(item.data)
            //console.log(['import lists',parsed])
            if (parsed) {
                localforageStorageLists.getItem('alldata').then(function(allLists) {
                    //console.log(['got list ',allLists])
                    var allListsIndex = {}
                    if (!allLists) {
                        allLists = []
                    }
                    // index by value
                    allLists.map(function(listItem) {
                        if (listItem && listItem.value && listItem.value.trim().length > 0)  {
                            allListsIndex[listItem.value] = listItem
                        }
                        return null
                    })
                    // update incoming list values
                    Object.keys(parsed).map(function(listName,i) {
                        var list = parsed[listName]  
                        if (list) {
                            list.map(function(listItem,listItemIndex) {
                                var newListItem = listItem;
                                // already there, just update tags
                                if (allListsIndex[listItem.value]) {
                                    if (listName !== '___') {
                                        if (listItem.tags) newListItem.tags.push(listName)
                                        else newListItem.tags = [listName]
                                    } else {
                                        newListItem.tags = []
                                    }
                                    if (title && title.trim().length > 0) newListItem.tags.push(title.trim())
                                    // uniquify and sort tags
                                    newListItem.tags = uniquifyArray(newListItem.tags).sort()
                                    //var tagsClean = {}
                                    //newListItem.tags.map(function(tag) {
                                        //tagsClean[tag] = true 
                                    //})
                                    //newListItem.tags = Object.keys(tagsClean).sort()
                                    
                                    allListsIndex[newListItem.value] = newListItem
                                // new list item    
                                } else {
                                    newListItem = {id: generateObjectId() , value: newListItem.value, synonym: newListItem.synonym ? newListItem.synonym : '', tags:[]}
                                    
                                    if (listName !== '___') {
                                        if (listItem.tags) newListItem.tags.push(listName)
                                        else newListItem.tags = [listName]
                                    }
                                    if (title && title.trim().length > 0) newListItem.tags.push(title.trim())
                                    // uniquify and sort tags
                                    newListItem.tags = uniquifyArray(newListItem.tags).sort()
                                    
                                    allListsIndex[newListItem.value] = newListItem
                                }
                                return null
                            })
                        }
                        return null
                    })
                    //console.log('IMPORT MERGE',res,parsed,[].concat(parsed,res))
                    localforageStorageLists.setItem('alldata',Object.values(allListsIndex)) 
                    props.history.push('/lists') 
                    //props.setPageMessage(<div><b>sdfsdf</b><br/><b>sdfsdf</b><br/><b>sdfsdf</b><br/><b>sdfsdf</b><br/></div>)
                    props.setPageMessage('Imported '+Object.keys(allListsIndex).length +' entities into the list '+ title)
                    setTimeout(function() {
                        props.setPageMessage('')
                    },2000)
                })
            } else {
                throw new Error("Failed import")
            }
        } else {
            throw new Error("Missing import data")
        }
    }
    var importFunctions = {importLists, importExamples, importUtterances, importEntities, importAll}
    //console.log(['RENDER LOMAN',props])
    return (
        <div className="LocalStorageUploadManager" >
            <Route 
                path={[`${props.match.path}/text/:itemId?`, `${props.match.path}/text`]}  
                render={(props) => <JSONTextEditor {...props} 
                    item={findBy('id',props.match.params.itemId)} 
                    saveItem={saveItemWrap} deleteItem={deleteItem} findKeyBy={findKeyBy} 
                    
                />}     
            />
            <Route {...props} exact path={props.match.path} 
                render={function(iprops) { return  <IndexPage {...props} 
                    items={items}
                    deleteItem={deleteItem} saveItem={saveItemWrap} importFunctions={importFunctions} 
                    handleFileSelection={handleFileSelection}
                />}} 
            />

        </div>
    );
}
