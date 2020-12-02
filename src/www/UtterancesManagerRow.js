/* global window */
import {Button } from 'react-bootstrap'
import React ,{useState}from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTags from 'react-tag-autocomplete'
import useListItemRow from './useListItemRow'
import SuggestionComponent from './components/SuggestionComponent'
import checkImage from './images/check.svg'
import TagComponent from './components/TagComponent'
import YouTube from 'react-youtube';

import FileReaderInput from 'react-file-reader-input';
import "video-react/dist/video-react.css"; // import css
import { Player } from 'video-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
    
    
function YouTubeGetID(url){
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}


export default function UtterancesManagerRow(props) {
        const  {item, splitNumber , style} = props;
       const {    
            tags, reactTags, addListItemData, deleteListItemData, updateListItemData, moveListItemDataUp, moveListItemDataDown,
            onTagDelete, onTagAddition, updateExampleContent,updateExampleSynonym,  selectItem, deselectItem
        } = useListItemRow(props.item, props.saveItem, props.splitNumber, props.style, props.lastSelected, props.setLastSelected, props.selectBetween)
        
        const [imageGrabUrl, setImageGrabUrl] = useState('')
        const [audioGrabUrl, setAudioGrabUrl] = useState('')
        const [videoGrabUrl, setVideoGrabUrl] = useState('')
        const [frameGrabUrl, setFrameGrabUrl] = useState('')
        
        function updateExampleSynonymWrap(content) {
            updateExampleSynonym(content)
            //console.log(['UES',content])
            var lines = content ? content.split("\n") : []
            //console.log(['UES lines ',lines])
                
            if (lines && lines.length > 1) {
                if (!(item && item.value && item.value.trim().length > 0)) {
                    var newContent = lines[0].trim()  //.replaceAll(' ','_')
                    //console.log(['UES update ',newContent])
                    updateExampleContent(newContent)
                }
            }
            
        }   
        
          
    function handleFileSelection(type ,ev, results) {
        ev.preventDefault()
        if (results) {
            results.forEach(result => {
                const [e, file] = result;
                var item = {id:null, title:file.name}
                const reader = new FileReader();
                reader.onload = (function(item) { return function(e) { item.data = e.target.result; doSave(item)}; })(item);
                reader.readAsDataURL(file)
                function doSave(item) {  
                    addListItemData(type,{label:file.name,href:item.data}) 
                 }
            });
            
        }
    }   
    
    
    function handleUrlGrab(type,url) {
        var videoId = YouTubeGetID(url)
            
        //if (type==='video') {
            //console.log('ISYOUTUBE '+videoId)
        //}
        
        addListItemData(type,{label:url,href:url, youtubeVideoId: videoId, start:'', end:''}) 
        setImageGrabUrl('')
        setAudioGrabUrl('')
        setVideoGrabUrl('')
        setFrameGrabUrl('')
         
        //// Initialize the XMLHttpRequest and wait until file is loaded
        //var xhr = new XMLHttpRequest();
        //xhr.onload = function () {
          //// Create a Uint8Array from ArrayBuffer
          //var codes = new Uint8Array(xhr.response);

          //// Get binary string from UTF-16 code units
          //var bin = String.fromCharCode.apply(null, codes);

          //// Convert binary to Base64
          //var b64 = btoa(bin);
          //console.log(b64); //-> "R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs="
        //};
        //xhr.open('GET', url);
        //xhr.responseType = 'arraybuffer';
        //xhr.send();

    }

       
       //var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                   
                   <div style={{float:'right'}} > 
                        <Button  variant="danger"  size="sm" style={{float:'right', fontWeight:'bold', borderRadius:'15px', marginTop:'0.2em'}} onClick={function(e) {if (window.confirm('Really delete')) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}}} >X</Button>
                   </div>
                   
                   <div style={{float:'left'}}>
                     {!item.isSelected && <Button style={{float: 'left'}} size="lg" variant="secondary" onClick={function(e) {selectItem(splitNumber,e)}} ><img style={{height:'1em'}} src={checkImage} alt="Select"  /></Button>}
                      {item.isSelected && <Button style={{float: 'left'}} size="lg" variant="success" onClick={function() {deselectItem(splitNumber)}} ><img style={{height:'1em'}} src={checkImage} alt="Deselect"  /></Button>}
                    </div>
                   <label style={{float:'left', marginLeft:'0.5em'}}  >Key <input size="50"
                       type='text'  value={item.value}  onChange={function(e) { updateExampleContent(e.target.value)}} />
                    </label>
                    
                    
                    <label style={{float:'left', marginLeft:'0.5em'}} >
                     <span  style={{float:'left', marginRight:'0.5em'}}>Lists </span>
                     <span  style={{float:'left'}}>
                       <ReactTags
                        placeholderText="Add to list"
                        minQueryLength={0}
                        maxSuggestionsLength={50}
                        autoresize={false}
                        allowNew={true}
                        ref={reactTags}
                        tags={tags}
                        tagComponent={function(iprops) {return <TagComponent {...iprops}    lookups={props.lookups}  />}}suggestionComponent={SuggestionComponent}
                        suggestions={props.lookups.utteranceTagsLookups.map(function(listName,i) {return {id: i, name: listName}})}
                        onDelete={onTagDelete}
                        onAddition={onTagAddition} /> 
                        </span>
                    </label>
                        
                 
                    <label style={{width:'100%'}} ><span style={{float:'left', marginRight:'0.5em'}}>Utterances</span> 
                        <textarea style={{width:'90%', minWidth:"34em", height:"5em"}} type='text' value={item.synonym} onChange={function(e) {updateExampleSynonymWrap(e.target.value)}} />
                    </label>
                    
                    <div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em'}}>Buttons</span> 
                        <Button variant="success" onClick={function(e) {addListItemData('buttons',{label:'',utterance:'',link:''})} }>New Button</Button>
                        {Array.isArray(item.buttons) && item.buttons.map(function(button,buttonKey) {
                            return <div  style={{marginTop:'0.5em'}} key={buttonKey}>
                                <Button variant="danger" onClick={function(e) {deleteListItemData('buttons', buttonKey)}} > X </Button>
                                <Button variant="primary"onClick={function(e) {moveListItemDataUp('buttons', buttonKey)}}  > ^ </Button>
                                <Button variant="primary" onClick={function(e) {moveListItemDataDown('buttons', buttonKey)}}  > v </Button>
                                
                                <label>&nbsp;&nbsp;&nbsp;Label&nbsp;&nbsp; <input type="text" value={button.label} onChange={function(e) {var newButton = button; newButton.label = e.target.value; updateListItemData('buttons',buttonKey,newButton)}} /></label>
                                
                                <label>&nbsp;&nbsp;&nbsp;Utterance&nbsp;&nbsp; <input type="text"  value={button.utterance} onChange={function(e) {var newButton = button; newButton.utterance = e.target.value; updateListItemData('buttons',buttonKey,newButton)}} /></label>
                                
                                <label>&nbsp;&nbsp;&nbsp;Link&nbsp;&nbsp; <input type="text"  value={button.link} onChange={function(e) {var newButton = button; newButton.link = e.target.value; updateListItemData('buttons',buttonKey,newButton)}} /></label>
                                
                            </div>
                                
                        })}
                    </div>
                    
                    <div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em', float:'left'}}>Texts</span> 
                        <Button style={{marginRight:'0.5em', float:'left'}}variant="success" onClick={function(e) {addListItemData('texts',{label:'',text:''})} }>New Text</Button>
                        {Array.isArray(item.texts) && item.texts.map(function(button,buttonKey) {
                            return <div  style={{marginTop:'0.5em', clear:'both'}} key={buttonKey}>
                                <Button variant="danger" onClick={function(e) {deleteListItemData('texts', buttonKey)}} > X </Button>
                                <Button variant="primary"onClick={function(e) {moveListItemDataUp('texts', buttonKey)}}  > ^ </Button>
                                <Button variant="primary" onClick={function(e) {moveListItemDataDown('texts', buttonKey)}}  > v </Button>
                                
                                <label>&nbsp;&nbsp;&nbsp;Label&nbsp;&nbsp; <input type="text" value={button.label} onChange={function(e) {var newButton = button; newButton.label = e.target.value; updateListItemData('texts',buttonKey,newButton)}} /></label>
                                
                                <label>&nbsp;&nbsp;&nbsp;Text&nbsp;&nbsp; <textarea style={{width:'40em', height:'5em'}}  value={button.text} onChange={function(e) {var newButton = button; newButton.text = e.target.value; updateListItemData('texts',buttonKey,newButton)}} /></label>
                                
                            </div>
                                
                        })}
                    </div>   
                    
                    
                    
                    <div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em'}}>Images</span> 
                         <form  style={{float:'right', marginLeft:'1em'}} onSubmit={function(e) {e.preventDefault()}} >
                            <FileReaderInput multiple as="binary" id={"image-file-input"}
                                             onChange={function(ev, results) {return handleFileSelection('images',ev, results)}}>
                              <Button variant="success" style={{ marginRight:'0.5em'}} >Select files</Button>
                            </FileReaderInput>
                        </form>
                        <form  style={{float:'right'}} onSubmit={function(e) {e.preventDefault(); handleUrlGrab('images',imageGrabUrl) }} >
                            <input type='text' value={imageGrabUrl} onChange={function(e) {setImageGrabUrl(e.target.value)}} />
                            <Button variant="success" type="submit" >From URL</Button>
                        </form>
                        {Array.isArray(item.images) && item.images.map(function(button,buttonKey) {
                        return <div style={{marginTop:'0.5em', clear:'both'}} key={buttonKey}>
                            <Button variant="danger" onClick={function(e) {deleteListItemData('images', buttonKey)}} > X </Button>
                            <Button variant="primary"onClick={function(e) {moveListItemDataUp('images', buttonKey)}}  > ^ </Button>
                            <Button variant="primary" onClick={function(e) {moveListItemDataDown('images', buttonKey)}}  > v </Button>
                            
                            <label>&nbsp;&nbsp;&nbsp;Label&nbsp;&nbsp; <input size="60" type="text" value={button.label} onChange={function(e) {var newButton = button; newButton.label = e.target.value; updateListItemData('images',buttonKey,newButton)}} /></label>
                            
                            
                            <label>&nbsp;&nbsp;&nbsp;URL&nbsp;&nbsp; <input size="60" type="text" value={button.href} onChange={function(e) {var newButton = button; newButton.href = e.target.value; updateListItemData('images',buttonKey,newButton)}} /></label>
                            
                            <label>&nbsp;&nbsp;&nbsp;File&nbsp;&nbsp; 
                            
                               
                                {button.href && <img style={{maxWidth:'100px'}} src={button.href} />}
                            
                            </label>
                            
                            
                            </div>
                        })}
                    </div> 
                    
                    
                    <div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em'}}>Audio</span> 
                         <form  style={{float:'right', marginLeft:'1em'}} onSubmit={function(e) {e.preventDefault()}} >
                            <FileReaderInput multiple as="binary" id={"audio-file-input"}
                                             onChange={function(ev, results) {return handleFileSelection('audio',ev, results)}}>
                              <Button variant="success" style={{ marginRight:'0.5em'}} >Select files</Button>
                            </FileReaderInput>
                        </form>
                        <form  style={{float:'right'}} onSubmit={function(e) {e.preventDefault(); handleUrlGrab('audio',audioGrabUrl) }} >
                            <input type='text' value={audioGrabUrl} onChange={function(e) {setAudioGrabUrl(e.target.value)}} />
                            <Button variant="success" type="submit" >From URL</Button>
                        </form>
                        {Array.isArray(item.audio) && item.audio.map(function(button,buttonKey) {
                        return <div style={{marginTop:'0.5em'}} key={buttonKey}>
                            <Button variant="danger" onClick={function(e) {deleteListItemData('audio', buttonKey)}} > X </Button>
                            <Button variant="primary"onClick={function(e) {moveListItemDataUp('audio', buttonKey)}}  > ^ </Button>
                            <Button variant="primary" onClick={function(e) {moveListItemDataDown('audio', buttonKey)}}  > v </Button>
                            
                            
                            
                            <label>&nbsp;&nbsp;&nbsp;Label&nbsp;&nbsp; <input size="60" type="text" value={button.label} onChange={function(e) {var newButton = button; newButton.label = e.target.value; updateListItemData('audio',buttonKey,newButton)}} /></label>
                            
                        
                            
                             <label>&nbsp;&nbsp;&nbsp;Auto play?&nbsp;&nbsp; <input size="60" type="checkbox" checked={button.autoplay === 'true' ? true : false} onChange={function(e) { var newButton = button; newButton.autoplay = e.target.checked ? 'true' : 'false'; updateListItemData('video',buttonKey,newButton)}} /></label>
                            
                            {<>
                                 <label>&nbsp;&nbsp;&nbsp;Start&nbsp;&nbsp; <input size="6" type="text" value={button.start} onChange={function(e) { var newButton = button; newButton.start = e.target.value; updateListItemData('audio',buttonKey,newButton)}} /></label>
                             
                                 <label>&nbsp;&nbsp;&nbsp;End&nbsp;&nbsp; <input size="6" type="text" value={button.end} onChange={function(e) { var newButton = button; newButton.end = e.target.value; updateListItemData('audio',buttonKey,newButton)}} /></label>                            
                            </>}
                            
                            
                            {button.href && <span style={{marginLeft:'1em' ,position: 'relative', height:"100px", width:"100px" }}>
                             <audio
                                src={button.href}
                                controls
                              />
                            </span>}
                            
                            
                            </div>
                        })}
                    </div> 
                    
                    
                    <div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em'}}>Video</span> 
                         <form  style={{float:'right', marginLeft:'1em'}} onSubmit={function(e) {e.preventDefault()}} >
                            <FileReaderInput multiple as="binary" id={"video-file-input"}
                                             onChange={function(ev, results) {return handleFileSelection('video',ev, results)}}>
                              <Button variant="success" style={{ marginRight:'0.5em'}} >Select files</Button>
                            </FileReaderInput>
                        </form>
                        <form  style={{float:'right'}} onSubmit={function(e) {e.preventDefault(); handleUrlGrab('video',videoGrabUrl) }} >
                            <input type='text' size="40" value={videoGrabUrl} onChange={function(e) {setVideoGrabUrl(e.target.value)}} />
                            <Button variant="success" type="submit" >From URL</Button>
                        </form>
                        {Array.isArray(item.video) && item.video.map(function(button,buttonKey) {
                        
                        var videoId = YouTubeGetID(button.href)
                        
                        return <div style={{marginTop:'1.5em'}} key={buttonKey}>
                            <Button variant="danger" onClick={function(e) {deleteListItemData('video', buttonKey)}} > X </Button>
                            <Button variant="primary"onClick={function(e) {moveListItemDataUp('video', buttonKey)}}  > ^ </Button>
                            <Button variant="primary" onClick={function(e) {moveListItemDataDown('video', buttonKey)}}  > v </Button>
                            
                            <label>&nbsp;&nbsp;&nbsp;Label&nbsp;&nbsp; <input size="60" type="text" value={button.label} onChange={function(e) {var newButton = button; newButton.label = e.target.value; updateListItemData('video',buttonKey,newButton)}} /></label>
                            <label>&nbsp;&nbsp;&nbsp;Auto play?&nbsp;&nbsp; <input size="60" type="checkbox" checked={button.autoplay === 'true' ? true : false} onChange={function(e) { var newButton = button; newButton.autoplay = e.target.checked ? 'true' : 'false'; updateListItemData('video',buttonKey,newButton)}} /></label>
                            
                             <label>&nbsp;&nbsp;&nbsp;URL&nbsp;&nbsp; <input size="60" type="text" value={button.href} onChange={function(e) {var newButton = button; newButton.href = e.target.value; updateListItemData('video',buttonKey,newButton)}} /></label>
                            
                             {<>
                                 <label>&nbsp;&nbsp;&nbsp;Start&nbsp;&nbsp; <input size="6" type="text" value={button.start} onChange={function(e) { var newButton = button; newButton.start = e.target.value; updateListItemData('video',buttonKey,newButton)}} /></label>
                             
                                 <label>&nbsp;&nbsp;&nbsp;End&nbsp;&nbsp; <input size="6" type="text" value={button.end} onChange={function(e) { var newButton = button; newButton.end = e.target.value; updateListItemData('video',buttonKey,newButton)}} /></label>                            
                            </>}
                            
                            {false && <>{(videoId) && <YouTube opts={{height:'80', playerVars:{}}}  videoId={button.youtubeVideoId}  />}
                            {(!videoId && button.href) && <span style={{position: 'relative', height:"80px", width:"80px" }}>
                             <Player height={'80'} fluid={false} >
                              <source src={button.href} />
                            </Player>
                            </span>}
                            </>}
                            </div>
                        })}
                    </div> 
                    
                    
                    <div style={{marginTop:'0.5em', borderTop:'1px solid grey', clear:'both'}}>
                        <span style={{marginRight:'0.5em'}}>Frames</span> 
                         <form  style={{float:'right'}} onSubmit={function(e) {e.preventDefault(); handleUrlGrab('frames',frameGrabUrl) }} >
                            <input type='text' size="40" value={frameGrabUrl} onChange={function(e) {setFrameGrabUrl(e.target.value)}} />
                            <Button variant="success" type="submit" >New Frame</Button>
                        </form>
                        {Array.isArray(item.frames) && item.frames.map(function(button,buttonKey) {
                        return <div style={{marginTop:'1.5em'}} key={buttonKey}>
                            <Button variant="danger" onClick={function(e) {deleteListItemData('frames', buttonKey)}} > X </Button>
                            <Button variant="primary"onClick={function(e) {moveListItemDataUp('frames', buttonKey)}}  > ^ </Button>
                            <Button variant="primary" onClick={function(e) {moveListItemDataDown('frames', buttonKey)}}  > v </Button>
                            
                            <label>&nbsp;&nbsp;&nbsp;Label&nbsp;&nbsp; <input size="60" type="text" value={button.label} onChange={function(e) {var newButton = button; newButton.label = e.target.value; updateListItemData('frames',buttonKey,newButton)}} /></label>
                            
                          
                            {button.href && <span style={{float:'right', position: 'relative', height:"100px", width:"100px" }}>
                             <iframe height={100}  src={button.href} />
                            </span>}
                            
                            </div>
                        })}
                    </div> 
                    
                        
                    
            </div> 
               
      </div>
}
