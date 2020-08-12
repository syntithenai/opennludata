import {Route} from 'react-router-dom'
import React, {useEffect} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useDB from './useDB'
import {parseImportText, parseLists} from './parsers'
import localforage from 'localforage'
import {NewFileButtons, FilesList} from './components/Components'
import JSONTextEditor from './components/JSONTextEditor'
import {generateObjectId, uniquifyArray } from './utils'

// COMPONENTS
function IndexPage(props) {
    //console.log(['man index ',props])
    return <div>
                 <NewFileButtons {...props} />
                 <h1>Sources</h1>
                 <FilesList {...props} />
            </div>
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
               var item = {id:null, data:e.target.result, title:file.name}
                saveItem(item)
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
    
    //console.log(['RENDER LOMAN',props])
    return (
        <div className="LocalStorageUploadManager" >
            <Route 
                path={[`${props.match.path}/text/:itemId?`, `${props.match.path}/text`]}  
                render={(props) => <JSONTextEditor {...props} 
                    item={findBy('id',props.match.params.itemId)} 
                    saveItem={saveItem} deleteItem={deleteItem} findKeyBy={findKeyBy} 
                    
                />}     
            />
            <Route {...props} exact path={props.match.path} 
                render={function(iprops) { return  <IndexPage {...props} 
                    items={items}
                    deleteItem={deleteItem} saveItem={saveItem} importExamples={importExamples} importLists={importLists}
                    handleFileSelection={handleFileSelection}
                />}} 
            />

        </div>
    );
}
