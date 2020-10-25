/* global window */
import React,{useState, useEffect} from 'react'

//import styles from './styles.module.css'


//const mespeak = require('./mespeak.js')


var meSpeak = window.meSpeak
//console.log(['MESPEAK',meSpeak])

export const ChatUIComponent = (props) => {
    
    var [voices,setVoices] = useState(null)
    //var [collatedHistory,setCollatedHistory] = useState([])
    //var [history,setHistory] = useState([])
    var meSpeakId = null
    var [userMessage,setUserMessage] = useState('')
    
    
    //function collateHistory()  {
        //var collated = []
        //var current = {};
        //var firstBotEntry = null;
        //console.log(['COLLAT',props.history]);
        //[].concat(props.history).slice(0,100).map(function(entry) {
            //if (entry.user) {
                //if (Object.keys(current).length > 0) {
                    //collated.push(current)
                    //current = {}
                //}
                //current.user = entry.user
            //}
            //if (Array.isArray(entry.bot)) {
                ////firstBotEntry = (firstBotEntry === null) ? entry.bot : firstBotEntry;
                //if (!Array.isArray(current.bot)) current.bot = []
                //entry.bot.map(function(entry) { current.bot.push(entry)})
            //}
        //})
        //if (Object.keys(current).length > 0) {
            //collated.push(current)
        //}
        ////// welcome intent
        ////if (collated.length === 0 && firstBotEntry) {
            ////collated.push({user:'',bot:firstBotEntry})
        ////}
        //console.log(['COLLATED',collated])
        //setCollatedHistory(collated)
    //}
    
    //useEffect(() => {
        //collateHistory()
        ////if (meSpeak) meSpeak.loadVoice('en/en-us');
        ////initSpeechSynthesis()
        //setTimeout(function() {
            ////if (meSpeak) meSpeak.speak('hello world');

            ////.say('help me') 
        //},300)
    //},[props.history])
    
    function sendUserMessage(message) {
        //var newHistory = props.history
        //newHistory.push({user:message})
        if (props.sendUserMessage) {
            props.sendUserMessage(message).then(function(response) {
                console.log(['chat msg resp',response])
                if (response) {
                    window.scrollTo(0,0)
                    //newHistory.push({bot:response})
                    // sequential handling of audio outputs
                    // utterances
                    //if (props.speakBotResponse) props.speakBotResponse(response) 
                    //setHistory(newHistory)
                    //collateHistory()
                    setUserMessage(' ')
                }
            })
        } else {
            var response = {bot:{utterance:'Missing property sendUserMessage',buttons:[{text:'Try again'}]}}
            //newHistory.push({bot:response})
            //setHistory(newHistory)
            //collateHistory()
            setUserMessage(' ')
        }
    }
    
    

    var history = props.history
     //[]
    //try {
        //history = JSON.parse(props.history)
    //} catch (e) {
        //console.log(e)
    //}
    
  return <div style={{border:'1px solid black', padding:'1em', width:'100%'}}>
    <button onClick={function(e) { setUserMessage('next track') ; sendUserMessage('next track')}} >Next track</button>
    <button onClick={function(e) { setUserMessage('play some jazz'); sendUserMessage('play some jazz')}} >JAZZ</button>
        <form onSubmit={function(e) {
            e.preventDefault(); 
            sendUserMessage(userMessage)
        }} >
            <input type='text' style={{width:'100%'}} value={userMessage} placeholder={'Start a conversation'} onChange={function(e) {setUserMessage(e.target.value)}} />
        </form>
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
                                        return <img  key={key}  src={image} />
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.texts && <div style={{ margin:'0.5em'}} >
                                    {botEntry.texts.map(function(text,key) {
                                        return <div  key={key} >{text.text}</div>
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.audio && <div style={{ margin:'0.5em'}} >
                                    {botEntry.audio.map(function(audioFile,key) {
                                        if (audioFile.autoplay === 'true') {
                                            return <div  key={key}  ></div>
                                        } else {
                                            return <audio  key={key}  src={audioFile.href} controls  />
                                        }
                                    })}
                                </div>}
                                
                                {botEntry && botEntry.video && <div style={{ margin:'0.5em'}} >
                                    {botEntry.video.map(function(video,key) {
                                        return <video  style={{height:'150px'}}  key={key}  src={video.href} controls />
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




