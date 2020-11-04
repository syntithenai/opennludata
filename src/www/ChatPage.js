/* global window */

//, Modal
import React, {useState, useEffect, useContext, useRef} from 'react';
import {ListGroup, Button, Accordion, Card, AccordionContext} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import useSkillsEditor from './useSkillsEditor'
import { ChatUIComponent } from './components/ChatUIComponent'
//import 'chatui/dist/index.css'
import {exportJSON} from './export/exportJSON'
import DialogManager from 'voicedialogjs'
//import localforage from 'localforage'
import YouTube from 'react-youtube';
import MicrophoneComponent from './MicrophoneComponent'
//var config={}
    
var meSpeak = window.meSpeak

function YouTubeGetID(url){
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}

            
function ChatPage(props) {
    var videoref = useRef(null)
    var youtuberef = useRef(null)
    var [ready,setReady] = useState(false)
    var [chat,setChat] = useState(false)
    var [dm,setDm] = useState(null)
    var [mute,setMuteInner]  = useState(false)
    var [history, setHistoryInner] = useState([])
    var [fullScreenVideo, setFullScreenVideo] = useState(null)
    var [fullScreenYoutube, setFullScreenYoutube] = useState(null)
    var [userMessage,setUserMessage] = useState('')
    
    //const {currentSkill} = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    var skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    // share skills editor from props if using inside skills page otherwise independant db connect via skillsEditor
    var currentSkill = props.currentSkill 
    if (!currentSkill) {
        currentSkill = skillsEditor.currentSkill
    }
    //var d = null
    var audio  = null
    var [historyHash,setHistoryHash] = useState(null)
    function setMute(val) {
        if (val) {
            meSpeak.stop();
            //console.log(['audio',audio])
            if (audio) audio.pause()
            if (videoref && videoref.current) {
                videoref.current.pause()
                setFullScreenVideo(null)
            }
        }
        localStorage.setItem('mute_chat',val ? 'true' : false)
        setMuteInner(val)  
    }
    
    function setHistory(history) {
        setHistoryInner(history)
        setHistoryHash(JSON.stringify(history))
        localStorage.setItem('chat history',JSON.stringify(history))
    }
    
    useEffect( () => {
        var lsMute = localStorage.getItem('mute_chat')
        setMuteInner(lsMute === 'true' ? true : false)
        //setHistoryHash(JSON.stringify(history))
    },[])
       
    //useEffect( () => {
        ////console.log('UP HIST')
        ////setHistoryHash(JSON.stringify(history))
    //},[history])
       
       
       
    function speakBotResponse(response) {
        return new Promise(function(resolve,reject) {
            var lsMute = localStorage.getItem('mute_chat')
            if (lsMute === 'true') {
                resolve() 
            } else {
                //console.log(['DASPEECH',response]) 
                var speechParts=[]
                if (Array.isArray(response)) response.map(function(utterance) {
                   if (utterance && utterance.utterance)  speechParts.push({text:utterance.utterance})
                   if (utterance && Array.isArray(utterance.audio ))  utterance.audio.map(function(audioFile) {
                       if (audioFile.href && audioFile.autoplay === 'true') speechParts.push({audio:audioFile.href, start: audioFile.start, end: audioFile.end})
                    })
                   if (utterance && Array.isArray(utterance.video ))  utterance.video.map(function(videoFile) {
                       if (videoFile.href && videoFile.autoplay === 'true') speechParts.push({video:videoFile.href,  start: videoFile.start, end: videoFile.end})
                    })
                    //
                })
                //console.log(['SPEECH parts',speechParts])
                
                speakSpeechParts(speechParts).then(function() {console.log('HAN spoken');resolve()})
            }
            
            
            function speakSpeechPart(part) {
                //console.log(['SPEECH audio st',part,mute])
                return new Promise(function(iresolve,ireject) {
                    var lsMute = localStorage.getItem('mute_chat')
                    if (lsMute === 'true') {
                        iresolve()
                    } else {
                        meSpeak.stop();
                        //console.log(['SPEAK SPEECH parts',part.text])
                        if (part && part.text) {
                            meSpeak.speak(part.text,{},function() {
                                //console.log(['SPEECH speak called',part.text,part])
                                iresolve()
                            })
                        } else if (part && part.audio) {
                            //console.log(['SPEECH audio',part.audio])
                            //meSpeak.speak(part.text,{},function() {
                                //console.log(['SPEECH speak called',part.text,part])
                                 audio = new Audio(part.audio);
                                 audio.onended = function() {
                                     //console.log(['SPEECH audio end'])
                                    iresolve()
                                 }
                                 audio.onerror = function() {
                                     //console.log(['SPEECH audio end'])
                                    iresolve()
                                 }
                                 //audio.onpause = function() {
                                     ////console.log(['SPEECH audio end'])
                                    //iresolve()
                                 //}
                                 audio.onloadedmetadata = function(){ 
                                     if (part.start > 0) {
                                         audio.currentTime = part.start; 
                                     }
                                 }
                                 audio.ontimeupdate = function() {
                                     //console.log(['SPEECH video timeupdate',audio.currentTime])
                                     dm.slot('audioPlayerCurrentTime',audio.currentTime)
                                     if (part.end > 0  && audio.currentTime > part.end) {
                                         audio.pause()
                                     }
                                 }
                                 audio.loop = false;
                                 //console.log(['SPEECH audio play'])
                                 audio.play(); 
                                 
                            //})

                        } else if (part && part.video) {
                                
                                //<YouTube videoId={videoId}  start={video && video.start ? video.start : ''} end={video && video.end ? video.end : ''} autoplay={video && video.autoplay ? 1 : 0}  />
                                var videoId = part && part.video ? YouTubeGetID(part.video) : ''
                                //console.log(['SPEECH video',part,videoId])
                                            
                                if (videoId) {
                                     //iresolve()
                                     function ytEnded() {
                                        setFullScreenYoutube(null)
                                        iresolve()
                                     }
                                     //
                                     setFullScreenYoutube({start: part.start, end: part.end, autostart: part.autostart,  onEnd: ytEnded,  onError: ytEnded, youtubeVideoId: videoId})
                                     //ytEnded()onPause: ytEnded,
                                } else { 
                                    
                                    setFullScreenVideo(part)
                                    if (videoref && videoref.current) {
                                        videoref.current.onended = function() {
                                            //console.log(['SPEECH video end'])
                                            setFullScreenVideo(null)
                                            iresolve()
                                        }
                                        videoref.current.onerror = function() {
                                            //console.log(['SPEECH video end'])
                                            setFullScreenVideo(null)
                                            iresolve()
                                        }
                                        videoref.current.ontimeupdate = function() {
                                             //console.log(['SPEECH video timeupdate',videoref.current.currentTime])
                                             dm.slot('videoPlayerCurrentTime',videoref.current.currentTime)
                                             if (part.end > 0  && videoref.current.currentTime > part.end) {
                                                 videoref.current.pause()
                                             }
                                         }
                                        //videoref.current.onpause = function() {
                                            //console.log(['SPEECH video end'])
                                            //setFullScreenVideo(null)
                                            //iresolve()
                                        //}
                                        //console.log('VIDCURR')
                                        videoref.current.play()
                                        
                                        //setFullScreenVideo(null)
                                    } else {
                                        //console.log('VIDCURR noref')
                                        iresolve()
                                    }
                                }
                        } else {
                            iresolve()
                        }
                    }
                })
            }
            
            function speakSpeechParts(speechPartsParam) {
                //console.log(['SPEAK SPEECH parts',speechPartsParam])
                return new Promise(function(iresolve,ireject) {
                    var lsMute = localStorage.getItem('mute_chat')
                    if (lsMute === 'true') {
                        iresolve()
                    } else {
                        //console.log(['AASPEAK SPEECH parts',speechPartsParam,speechPartsParam[0],speechPartsParam[0].text])
                        if (speechParts.length > 0) {
                            speakSpeechPart(speechPartsParam[0]).then(function() {
                                var newParts = speechPartsParam.slice(1)
                                //console.log(['SPEECH speak called new',newParts])
                                if (newParts.length > 0 && !mute) {
                                    //console.log(['SPEECH speak called recurseive',newParts])
                                    speakSpeechParts(newParts).then(function() {
                                        //console.log(['DONE SPEAK SPEECH parts complete'])
                                        iresolve()
                                    })
                                } else {
                                    //console.log(['DONE SPEAK SPEECH parts'])
                                    iresolve()
                                }
                            })
                        } else {
                            //console.log(['DONE SPEAK SPEECH parts no more '])
                            iresolve()
                        }
                    }
                })
            }
            
            //console.log(['SPEECHPARTS',speechParts])
            //if (meSpeak) {
                //meSpeak.stop();
                ////meSpeak.speakMultipart(speechParts,function() {
                ////console.log('finished speaking utterances')
                ////// audio (auto play true)
                
                ////// video (auto play true, fullscreen)
                
                
                ////})
            //}
        })
    }   
       
    function sendUserMessage(message) {      
        //console.log(['dm send msg',message])
        var newHistory = Array.isArray(history) ? history : []
        newHistory.push({user:message,bot:[]})
        setHistory(newHistory)
        window.scrollTo(0,0)
        if (dm && dm.run) {
            dm.run(message).then(function(response) {
                setUserMessage(' ')
            })
        } 
    }
    
    function handleBotMessage(utterance) {
        setFullScreenYoutube(null)
        setFullScreenVideo(null)
        var newHistory = []
        try {
            newHistory = JSON.parse(localStorage.getItem('chat history'))
        } catch (e) {
            console.log(e)
        }
        //console.log(['HANDLEBOT',JSON.parse(JSON.stringify(newHistory)),utterance])
        var lastMessage = newHistory.length > 0 ? newHistory[newHistory.length -1] :{user:'',bot:[]}
        if (!lastMessage.user) lastMessage.user = ''
        var bot = lastMessage && lastMessage.bot ? lastMessage.bot : []
        bot.push(utterance)
        lastMessage.bot = bot
        if (newHistory.length > 0) {
            //console.log(['HANDLEBOT replace',lastMessage])
            newHistory[newHistory.length -1] = lastMessage
        } else {
            //console.log(['HANDLEBOT push',lastMessage])
            newHistory.push(lastMessage)
            
        }
        //console.log(['HANDLEBOT newhist',JSON.parse(JSON.stringify(newHistory))])
        setHistory(newHistory)
        return speakBotResponse([utterance])
    }
    
    function resetHistory() {
        setHistory([])
        setTimeout(function() {
            //console.log(['RESET HIST',dm,dm ? dm.resetHistory: null])
            if (dm) {
                dm.init().then(function(botWelcome) {
                    var newHistory = []
                    newHistory.push({user:'',bot:botWelcome})
                    setHistory(newHistory)
                    setReady(true)
                })  
            }
        },1000)
    }
      
    function trainChat() {
        setHistory([])
        setReady(false)
        //console.log(['TRAIN reset history',history])
        return new Promise(function(resolve,reject) {
            //console.log(['TRAIN',JSON.parse(JSON.stringify(currentSkill))])
            setHistory([])
            exportJSON(currentSkill).then(function(config) {
                //console.log(['TRAIN dm exported json',config])
                var d = DialogManager(config ? config : {})
                //console.log(['TRAIN dm create ',d])
                d.handleBotMessage = handleBotMessage
                setDm(d)
                setReady(true)
                //console.log(['TRAIN dm set ready '])
                d.init().then(function(botWelcome) {
                    //console.log(['TRAIN dm initied',botWelcome])
                    setReady(true)
                    resolve([])
                })
            })
        })
    }  
     
    function YouTubeGetID(url){
        url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
    }
    
    //console.log(['DM',d,ready,config])
    useEffect(() => {
        if (currentSkill) {
            trainChat()
        }
    },[currentSkill])
       
    return <div>
      {( !props.hideBackLink) && <Link to={"./"} ><Button variant="warning" style={{float:'right'}}  >{'Back to Skill'}</Button></Link>}  
        
         {<Button variant="success" style={{float:'left'}}  onClick={function(e) {
            //resetHistory()
            trainChat()
            //.then(function(welcomeResponse) {    
                //setHistory({user:'',bot:welcomeResponse})
            //})
        }}>{'Train'}</Button>}
        
         {!mute && <Button variant="primary" style={{float:'right'}}  onClick={function(e) {
            setMute(true)
        }}>{'Mute'}</Button>}
        {mute && <Button variant="primary" style={{float:'right'}}  onClick={function(e) {
            setMute(false)
        }}>{'Unmute'}</Button>}
        {(fullScreenYoutube && fullScreenYoutube.youtubeVideoId) && <Button  variant="primary" style={{float:'right'}}  onClick={function(e) {setFullScreenYoutube(null)}}>Stop</Button>}
        
        {(!props.isFullScreen && props.lookups.isBigScreen && currentSkill) && <Link to={"/skills/skill/"+currentSkill.title+"/chat"} ><Button variant="primary" style={{float:'left'}}  >{'Fullscreen'}</Button></Link>}
        
        {false && <Button onClick={resetHistory} >Reset</Button>}
 
        <form onSubmit={function(e) {
            e.preventDefault(); 
            sendUserMessage(userMessage)
        }} >
            <div style={{clear:'both',marginTop:'0.5em', border:'2px solid lightgrey'}}>
                <div style={{clear:'both',marginTop:'0.5em', border:'2px solid grey'}}>
                    <div style={{border:'2px solid black', padding:'0.3em'}}>
                        <MicrophoneComponent style={{width:'2em', height:'2em', float:'right'}} onMessage={function(message) {setUserMessage(message); sendUserMessage(message);}} />
                        <input type='text' style={{width:'85%'}} value={userMessage} placeholder={history.length === 0 ? 'Start a conversation': ''} onChange={function(e) {setUserMessage(e.target.value)}} />
                    </div>
                </div>
            </div>
        </form>
        
        
        {fullScreenVideo && <div><br/> <br/> <video ref={videoref} id="myVid" width="100%" >
            <source src={fullScreenVideo} />
            Sorry, your browser does not support HTML5 video.
        </video></div>}
       
       {(fullScreenYoutube && fullScreenYoutube.youtubeVideoId) && <div><br/><br/>  <YouTube 
           key={'yt-fs'} 
           videoId={fullScreenYoutube.youtubeVideoId}  
           opts={{
            playerVars: {
                start: fullScreenYoutube.start, 
                end: fullScreenYoutube.end, 
                controls: 1,
                autoplay: 1
            }}} 
            onEnd={fullScreenYoutube.onEnd} 
            onError={fullScreenYoutube.onError} 
            onPause={fullScreenYoutube.onPause} 
        /></div>
     
                }
       
        {<>
        
        
      
     {<span style={{display:(ready ? 'block' : 'none')}} ><ChatUIComponent fullScreenVideo={fullScreenVideo} fullScreenYoutube={fullScreenYoutube} jsonhistory={JSON.stringify(history)} history={history}  sendUserMessage={sendUserMessage} /></span>}
    {!ready && <b style={{padding:'1em' , marginTop:'5em'}}>Loading</b>}
      </>}
    </div>
}

export default ChatPage
//JSON.stringify(dm ? [].concat(dm.chatHistory,
//SK {JSON.stringify(currentSkill)} || : [])
 
//  LOCAL{JSON.stringify(history)}
    
 
   ///**
     //* Synthesise speech from text and send to to audio output
     //*/ 
    //function say(text, voice='default') {
            //console.log(['TTS SAY',text]);
            
            ////if (voice === "default") {
                ////// js generated fallback
                ////speak(text,{
                    ////amplitude : !isNaN(parseFloat(this.props.config.voicevolume)) ? parseFloat(this.props.config.voicevolume) : 70,
                    ////pitch: !isNaN(parseFloat(this.props.config.voicepitch)) ? parseFloat(this.props.config.voicepitch) : 50,
                    ////speed : !isNaN(parseFloat(this.props.config.voicerate)) ? parseFloat(this.props.config.voicerate) * 2.2 : 175
                ////});
            ////} else {
                //// Create a new instance of SpeechSynthesisUtterance.
                //var msg = new SpeechSynthesisUtterance();
                //msg.text = text;
                //msg.volume = 100 //!isNaN(parseFloat(this.props.config.voicevolume)) ? parseFloat(this.props.config.voicevolume) : 50;
                //msg.rate = 0.5 // !isNaN(parseFloat(this.props.config.voicerate)) ? parseFloat(this.props.config.voicerate)/100 : 50/100;
                //msg.pitch = 50 //!isNaN(parseFloat(this.props.config.voicepitch)) ? parseFloat(this.props.config.voicepitch) : 50;
                //var voices = speechSynthesis.getVoices();
      
              //// Loop through each of the voices.
                //voices.forEach(function(voiceItem, i) {
                    //if (voiceItem.name === voice) msg.voice = voiceItem;
                    //window.speechSynthesis.speak(msg);
                //});
            ////}
            
       //// }
    //}
    
    //function initSpeechSynthesis() {
        //let that = this;
        //if ('speechSynthesis' in window) {
            //// Fetch the list of voices and populate the voice options.
            //function loadVoices() {
              //// Fetch the available voices.
                //var voices = speechSynthesis.getVoices();
              
              //// Loop through each of the voices
                //let voiceOptions=[];
                //voices.forEach(function(voice, i) {
                //// Create a new option element.
                    //voiceOptions.push({'name':voice.name,label:voice.name});
                //});
                //voiceOptions.push({'name':'default',label:'Browser Generated'});
                //setVoices(voiceOptions);
            //}

            //// Execute loadVoices.
            //loadVoices();

            //// Chrome loads voices asynchronously.
            //window.speechSynthesis.onvoiceschanged = function(e) {
              //loadVoices();
            //};
            
        //} else {
            //let voiceOptions=[];
            //voiceOptions.push({'name':'default',label:'Browser Generated'});
            //setVoices(voiceOptions);
        //}
        //console.log(['LOADED VOICES',voices]);
    //};
