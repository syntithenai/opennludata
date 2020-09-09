import {Route} from 'react-router-dom'
import React, {useEffect} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useDB from './useDB'
import useImportFunctions from './useImportFunctions'
import { saveAs } from 'file-saver';
import JSZip from 'jszip'
import {NewFileButtons} from './components/Components'
import JSONTextEditor from './components/JSONTextEditor'
//import {generateObjectId, uniquifyArray } from './utils'
import {Link} from 'react-router-dom'
import {Button, ListGroup } from 'react-bootstrap'
//import ImportListsDropDown from './components/ImportListsDropDown'
import localforage from 'localforage'

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
       
    var localforageStorageImport = localforage.createInstance({
        name: 'nlutool',
        storeName   :'importing',
    });
    
    
     const { items} = props  
     var saveSkill=function (skill) {
        localforageStorageImport.setItem('alldata',skill).then(function() {
            props.history.push('/importreview')
        })
     }
     var showError = function(e) {
         if (e.error) props.setPageMessage(e.error,2000)
         else props.setPageMessage(e.toString(),2000)
     }
     
    function downloadZip(item) {
        var zip = new JSZip();
        zip.loadAsync(item.data)
        .then(function(zip) {
            zip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
                saveAs(blob, item.title);      
            })
        });
     }
    
     
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >

                   
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {if(window.confirm('Really delete source '+item.title+'-'+i)) props.deleteItem(i)}} >Delete</Button>
                    
                    {item.fileType.endsWith(".zip") && <Button style={{float:"right", marginLeft:'0.5em'}} onClick={function() {downloadZip(item)}}>Download</Button>}

                    {!item.fileType.endsWith(".zip") && <Button style={{float:"right", marginLeft:'0.5em'}} onClick={function() {saveAs(new Blob([item.data], {type: 'application/'+item.fileType}), item.title+'.'+item.fileType)}}>Download</Button>}
    
                   {/* Can't edit zip files*/}
                   {!item.fileType.endsWith('.zip') && <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>}
                   
                   {item.fileType === "text" && <div className="textimportbuttons" >
                       <Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importFunctions.importIntents(item).then(saveSkill).catch(showError)  }}    >Import Intents</Button>
                       <Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importFunctions.importEntities(item).then(saveSkill).catch(showError)  }}    >Import Entities</Button>
                       <Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importFunctions.importUtterances(item).then(saveSkill).catch(showError)  }}    >Import Utterances</Button>
                    </div>}
                    
                    {item.fileType !== "text" && <>
                       {/* Import whatever is available */}
                       {<Button style={{float:'right', marginLeft:'0.5em'}} variant="success" 
                           onClick={function(e) { 
                               props.importFunctions.importAll(item)
                               // save import results and redirect to import overview
                               .then(saveSkill).catch(showError) 
                            }}    >Import</Button>}
                    </>}
                    
                   
                   <span style={{width:'90%'}}  > {item.fileType && <Button>{item.fileType}</Button>}&nbsp;&nbsp;&nbsp;{item.title}</span>
                  
               </ListGroup.Item>
        })
        return <ListGroup>{list}</ListGroup>
    } else {
        return null
    }
}
 //{/* Only import utterances */}
                       //{(item.fileType === "rasa.zip" || item.fileType === "mycroft.zip"  || item.fileType === "opennlu.zip"  || item.fileType !== "opennlu.lists") && <Button style={{float:'right', marginLeft:'0.5em'}} variant="success" onClick={function(e) { props.importFunctions.importUtterances(items[i]) }}    >Import Utterances</Button>}
                       //{/* Only import entities */}
                       //{<ImportListsDropDown lookups={props.lookups} importListTo={function(listName) {props.importFunctions.importEntities(items[i],listName)}} importTo={items[i].title} /> }
export default function LocalStorageUploadManager(props) {
    //console.log('man')
    //console.log(props)
     
    var importFunctions = useImportFunctions(props.setPageMessage)
     

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
               importFunctions.detectFileType(item).then(function(fileData) {
                    if (fileData && fileData.type) {
                        item.fileType = fileData.type
                        item.created_date = new Date().getTime()
                        //if (item.fileType.endsWith('.zip')) {
                            //item.data = new File([item.data],'application/zip')
                        //}
                        console.log(['SET ITEM TYPE', item.fileType])
                        saveItem(item,0)
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
  
    function saveItemWrap(item,index) {
        importFunctions.detectFileType(item).then(function(fileData) {
            item.fileType = fileData.type
            item.created_date = new Date().getTime()
            console.log(['SET ITEM TYPE', item.fileType])
            saveItem(item,index)
        })
    }
    
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
