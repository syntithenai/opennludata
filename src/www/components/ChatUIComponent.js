/* global window */
import React,{useState, useEffect} from 'react'
import YouTube from 'react-youtube';


function YouTubeGetID(url){
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}

export const ChatUIComponent = (props) => {
    
    function sendUserMessage(message) {
        if (props.sendUserMessage) {
            props.sendUserMessage(message)
        }
    }

    var history = props.history
    var mute = localStorage.getItem('mute_chat') === "true" ? true : false
    return <div style={{border:'1px solid black', padding:'1em', width:'100%'}}>
        {history.length > 0 && <div className="history" style={{padding:'0.5em', width:'100%', marginTop:'0.5em'}} >
          {[].concat(history).reverse().map(function(entry,ookey) {
           return (
                <div  style={{ borderTop:'3px solid black', marginTop:'0.1em',padding:'0.2em', width:'100%'}}  key={ookey} >
                {false &&  JSON.stringify(entry)}
                    {entry.user && <span style={{ marginBottom:'1em',marginTop:'1em',padding:'0.2em', width:'100%'}}><hr/><b>User: </b><button onClick={function() {sendUserMessage(entry.user)}} ><i>{entry.user}</i></button></span>} 
                    {Array.isArray(entry.bot) && <div>
                    {entry.bot.map(function(botEntry,okey) {
                         return (<div  key={okey}  >
                                {botEntry && botEntry.utterance && <div><b>Bot: </b><span>{botEntry.utterance}</span></div>}
                                {botEntry && botEntry.buttons && <div style={{ margin:'0.5em'}}>{botEntry.buttons.map(function(button,key) {
                                    return <button key={key} onClick={function(e) {
                                           e.preventDefault() 
                                           sendUserMessage(button.text ? button.text : button.label)
                                        }} >{button.label}</button>
                                })}</div>}
                                
                                {botEntry && botEntry.images && <div style={{ margin:'0.5em'}} >
                                    {botEntry.images.map(function(image,key) {
                                        return <img  key={key}  src={image.href} style={{width:'100%'}}/>
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.texts && <div style={{ margin:'0.5em'}} >
                                    {botEntry.texts.map(function(text,key) {
                                        return <div  key={key} >{text.text}</div>
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.audio && <div style={{ margin:'0.5em'}} >
                                    {botEntry.audio.map(function(audioFile,key) {
                                        if (audioFile.autoplay === 'true' && !mute) {
                                            return <div  key={key}  ></div>
                                        } else {
                                            return <audio  key={key}  src={audioFile.href} controls  />
                                        }
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.video && <div style={{ margin:'0.5em'}} >
                                    {botEntry.video.map(function(video,key) {
                                        if (video.autoplay === 'true' && !mute) {
                                            return <div  key={key}  ></div>
                                        } else {
                                            var videoId = video && video.href ? YouTubeGetID(video.href) : ''
                                            if (videoId) {
                                                var opts = {
                                                    playerVars: {
                                                        start: video.start, 
                                                        end: video.end, 
                                                        controls: 1,
                                                        autoplay: 0
                                                    }, 
                                                    
                                                }
                                               return  <YouTube key={key} videoId={videoId}  opts={opts} />
                                            } else {    
                                                return <video  style={{height:'150px'}}  key={key}  src={video.href} controls />
                                            }
                                        }
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.frames && <div style={{ margin:'0.5em'}} >
                                    {botEntry.frames.map(function(frame,key) {
                                        return <iframe  style={{width:'100%', height: '400px'}} key={key}  src={frame.href} />
                                    })}
                                </div>}
                                
                            </div>
                        )
                    })}    
                    </div>}
               </div>
            )
            })}
        </div>}
  </div>
}




