/* global window */
/* global cast */

//, Modal
import React, {Fragment, useState, useEffect, useContext, useRef} from 'react';
import {Container, Row, Col, ListGroup, Button, Accordion, Card, AccordionContext, Modal} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import { ChatUIComponent } from './ChatUIComponent'
import DialogManager from 'voicedialogjs'
import YouTube from 'react-youtube';
import MicrophoneComponent from './MicrophoneComponent'
//import useViewport from './useViewport' 
import { SizeMe } from 'react-sizeme'
//var config={}
import WebsocketAsrClient from './WebsocketAsrClient'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
    
var meSpeak = window.meSpeak

function YouTubeGetID(url){
    url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}

    
//function getAxiosClient()	{
    //if (props.getAxiosClient) {
        //return props.getAxiosClient()
    //} else {
        //console.log(['get axios client ',accessToken])
        //let axiosOptions={httpsAgent: new https.Agent({  
            //rejectUnauthorized: false
        //})};
        //axiosOptions.headers = {}
        //return axios.create(axiosOptions);
    //}
//}

function ChatPage(props) {
    var videoref = useRef(null)
    var youtuberef = useRef(null)
    var [ready,setReady] = useState(false)
    var [chat,setChat] = useState(false)
    var [dm,setDm] = useState(null)
    var [wc,setWc] = useState(null)
    var [mute,setMuteInner]  = useState(false)
    var [history, setHistoryInner] = useState([])
    var [fullScreenVideo, setFullScreenVideo] = useState(null)
    var [fullScreenYoutube, setFullScreenYoutube] = useState(null)
    var [userMessage,setUserMessage] = useState('')
    var [microphoneButtonStyle,setMicrophoneButtonStyle] = useState({})
    var [microphoneState,setMicrophoneState] = useState(0)
    
    //const {currentSkill} = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    //var skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    //// share skills editor from props if using inside skills page otherwise independant db connect via skillsEditor
    var currentSkill = props.currentSkill 
    //if (!currentSkill) {
        //currentSkill = skillsEditor.currentSkill
    //}
    //var d = null
    var audio  = null
    var [historyHash,setHistoryHash] = useState(null)
    var client = null
    const [show, setShow] = useState(false);
    var sideAppSource = null
    var sideAppOrigin = null

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    //const { width } = useViewport();
    const breakpoint = 768;

    useEffect(() => {
        //console.log(['update user',props.user])
        if (props.user && props.user.token) {
            //console.log(['update user have user',props.user])
            if (wc) {
                //console.log(['update user have wc',wc])
                wc.setUser(props.user)
            }
        }
    },[props.user])

    function setMute(val) {
        if (val) {
            if (meSpeak) meSpeak.stop();
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
        var shortHistory = []
        var chatHistoryLines = currentSkill && currentSkill.config  && currentSkill.config.chatHistory ? parseInt(currentSkill.config.chatHistory) : -1
        if (chatHistoryLines > 0) {
            shortHistory = history.reverse().slice(0,chatHistoryLines).reverse()
        } else {
            shortHistory = history
        }
        //console.log(['shortHistory',shortHistory])
        setHistoryInner(shortHistory)
        setHistoryHash(JSON.stringify(shortHistory))
        localStorage.setItem('chat history',JSON.stringify(shortHistory))
    }
    
    useEffect( () => {
        var lsMute = localStorage.getItem('mute_chat')
        setMuteInner(lsMute === 'true' ? true : false)
        //setHistoryHash(JSON.stringify(history))
        
    },[])
    
    // WINDOW MESSAGING
   
    function handleMessage(e) {
        //if ( e.origin === 'http://www.example.com' ) {
            if (e && e.data && e.data.source && e.data.source.indexOf('react')!==0)  {
                //console.log(['LOG Message received in parent',e])
                var data = {}
                try {
                    data = e.data ? JSON.parse(e.data) : {}
                    if (data.init === true) {
                        e.source.postMessage(JSON.stringify({registered:true}),e.origin)
                        sideAppSource = e.source
                        sideAppOrigin = e.origin
                    }
                    if (data.userMessage && data.userMessage.trim()) {
                        sendUserMessage(data.userMessage)
                    }
                } catch (e) {
                    
                }
            }
    }
    // Assign handler to message event
    if ( window.addEventListener ) {
        window.addEventListener('message', handleMessage, false);
    } else if ( window.attachEvent ) { // ie8
        window.attachEvent('onmessage', handleMessage);
    }   
    
    function sendWindowMessage(msg) {
        if (sideAppSource && sideAppOrigin) {
            sideAppSource.postMessage(JSON.stringify(msg),sideAppOrigin)
        } 
    }
       
    //useEffect( () => {
        ////console.log('UP HIST')
        ////setHistoryHash(JSON.stringify(history))
    //},[history])
       
    function sendCastMessage(msg){
        //console.log(['send cast',msg])
        if (window.cast) {
            //console.log(['send cast have wincast'])
          var castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
          //console.log(['send cast have session',castSession])
          if(castSession){
            castSession.sendMessage('urn:x-cast:chatui', msg);
            //console.log(['send cast sent message'])
          }
        } else {
            //console.log('no cast')
        }
    }   
       
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
                
                speakSpeechParts(speechParts).then(function() {resolve()})
            }
            
            
            function speakSpeechPart(part) {
                //console.log(['SPEECH audio st',part,mute])
                return new Promise(function(iresolve,ireject) {
                    var lsMute = localStorage.getItem('mute_chat')
                    if (lsMute === 'true') {
                        iresolve()
                    } else {
                        if (meSpeak) meSpeak.stop();
                        //console.log(['SPEAK SPEECH parts',part.text])
                        if (part && part.text) {
                            if (meSpeak){
                                 meSpeak.speak(part.text,{},function() {
                                //console.log(['SPEECH speak called',part.text,part])
                                    iresolve()
                                })
                            } else {
                                iresolve()
                            }
                        } else  if (part && part.audio) {
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
            
        })
    }   
       
    function sendUserMessage(message,dmIn) {
        var dmUsed = dmIn ? dmIn : dm;      
        //console.log(['dm send msg',message,dm])
        var newHistory = Array.isArray(history) ? history : []
        newHistory.push({user:message,bot:[]})
        setHistory(newHistory)
        window.scrollTo(0,0)
        if (dmUsed && dmUsed.run) {
            //console.log(['dm send msg real',message])
            dmUsed.run(message).then(function(response) {
                //console.log(['dm send msg real done',response])
                setUserMessage(' ')
                //startHotword()
            })
        } 
    }
    
    function handleBotMessage(utterance,startVoice,appData) {
        //console.log(['HANDLEBOT START',utterance,startVoice,dm,wc])
        sendCastMessage({utterance,startVoice,appData})
        sendWindowMessage({utterance,startVoice,appData})
        if (utterance) {
            setFullScreenYoutube(null)
            setFullScreenVideo(null)
            var newHistory = []
            try {
                newHistory = JSON.parse(localStorage.getItem('chat history'))
            } catch (e) {
                console.log(e)
            }
            //console.log(['HANDLEBOT',JSON.parse(JSON.stringify(newHistory)),utterance,startVoice])
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
            return new Promise(function(resolve,reject) {
                speakBotResponse([utterance]).then(function() {restartVoiceNow(startVoice); resolve() })
            })
        } else {
            return new Promise(function(resolve,reject) {
                restartVoiceNow(startVoice); 
                resolve() 
            })
        }
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
    
    function showListening() {
        setMicrophoneButtonStyle({border:'1px solid green', backgroundColor:'lightgreen'})
    }

    function showHotword() {
        setMicrophoneButtonStyle({border:'1px solid red', backgroundColor:'lightpink'})
    }

    function showStopped() {
        setMicrophoneButtonStyle({border:'1px solid red', backgroundColor:'grey'})
    }
    function showDisconnected() {
        setMicrophoneButtonStyle({border:'1px solid black', backgroundColor:'grey'})
    }
    function showSilentListening() {
        setMicrophoneButtonStyle({border:'1px dashed green', backgroundColor:'lightgreen'})
    }
   
    function restartVoiceNow(startVoice) {
        console.log(['RESTART VOICE start',startVoice,localStorage.getItem('auto_microphone'),client]) 
        if (localStorage.getItem('auto_microphone') === "YES") {
            if (client) {
                if (startVoice) {
                    console.log(['RESTART VOICE start']) 
                    //client.stopHotword()
                    client.startMicrophone()
                } 
                //else {
                    ////console.log(['RESTART VOICE hw']) 
                    //client.stopMicrophone()
                    //client.startHotword()
                //}
            }
        }
    }
    
    function disableAutoHotword() {
        //console.log('DISHW',wc,client)
        localStorage.setItem('auto_microphone','NO')
        if (wc) {
            wc.stopHotword()
            wc.stopMicrophone()
            setWc(null)
        }
        showDisconnected()
    }
    
       
    function toggleVoice() {
        localStorage.setItem('auto_microphone','YES')
        if (!wc) {
            //console.log('TOGGLE WC CREATE')
            createWebsocketClient(dm,currentSkill.userAvatar+"-"+currentSkill.title)
            setTimeout(function() { doToggle() },500)
        } else {
            doToggle()
        }
        
        function doToggle() {
            var useClient = wc
            if (!useClient) useClient = client
            //console.log(['TOGGLEVOIC',client,wc,useClient])
            
            if (useClient) {
                //console.log(['TOGGLEVOIC wcOK'])
                // active -> return to hotword
                if (microphoneState === 3) {
                    useClient.stopMicrophone()
                    useClient.startHotword()
                // hotword => start microphone
                } else if (microphoneState === 2) {
                    //console.log(['TOGGLEVOIC hw 2 act'])
                    //useClient.stopHotword()
                    useClient.startMicrophone()
                } else if (microphoneState === 1) {
                    useClient.stopMicrophone()
                    useClient.startHotword()
                } else if (microphoneState === 0) {
                    useClient.startHotword()
                    useClient.startMicrophone()
                }
            }
        }
    }   

    function createWebsocketClient(d,skillIdent) {
      //  if (!wc) {
            console.log(['CREATEWEBSOCKETCLIENT real',props])
                var config = {skill:skillIdent}
                //config.server = 'wss://api.opennludata.org:5000/'
                //config.server = 'ws://localhost:8080/'
                config.server = process.env.REACT_APP_speechServer ?  process.env.REACT_APP_speechServer : 'wss://localhost:5000/'
                config.user = props.user
                client = new WebsocketAsrClient(config)
                client.init()
                setWc(client)
                client.bind('message',function(message) {
                    //console.log(['MESSAGE',message])
                    sendUserMessage(message,d)
                })
                client.bind('error',function(event,message) {
                    console.log(['ERROR',event,'MESSAGE',message])
                })
                
                
                //client.bind('hotwordDetected',function() {
                   //showListening(); 
                //})
                client.bind('microphoneStart',function() {
                   showListening(); 
                   setMicrophoneState(3)
                })
                client.bind('hotwordStart',function() {
                   showHotword(); 
                   setMicrophoneState(2)
                })
                client.bind('hotwordStop',function() {
                   showStopped(); 
                   setMicrophoneState(1)
                })
                client.bind('microphoneStop',function() {
                   showHotword(); 
                   setMicrophoneState(2)
                })
                //client.bind('disconnect',function() {
                   //showDisconnected(); 
                   //setMicrophoneState(0)
                //})
                //client.bind('reconnect',function() {
                   //showDisconnected(); 
                   //setMicrophoneState(0)
                //})
                //client.bind('connect',function() {
                   //console.log('CONNECT CALLBACK');
                   //showStopped(); 
                   //state = 1
                //})
                client.bind('speaking',function() {
                    //console.log('SPEAK');
                    if (microphoneState == 3) {
                        showListening(); 
                    }
                })
                client.bind('stopspeaking',function() {
                    //console.log('STOP SPEAK');
                    if (microphoneState == 3) {
                        showSilentListening(); 
                    }
                })
        //}
    }
       
    function trainChat() {
        setHistory([])
        setReady(false)
        //console.log(['TRAIN reset history',history])
        return new Promise(function(resolve,reject) {
            //console.log(['TRAIN',JSON.parse(JSON.stringify(currentSkill))])
            setHistory([])
            //exportJSON(currentSkill).then(function(config) {
                //console.log(['TRAIN dm exported json',config])
                var d = DialogManager(currentSkill ? currentSkill : {})
                //console.log(['TRAIN dm create ',d])
                d.handleBotMessage = handleBotMessage
                setDm(d)
                setReady(true)
                //console.log(['TRAIN dm set ready '])
                d.init().then(function(botWelcome) {
                    //console.log(['TRAIN dm initied',botWelcome])
                    setReady(true)
                    //console.log(window.WebsocketAsrClient) 
                    
                    var autoHotword = localStorage.getItem('auto_microphone') === "YES" ? true : false
                    //console.log(['CREATEWEBSOCKETCLIENT',autoHotword,d])    
                    if (autoHotword) {
                        createWebsocketClient(d,currentSkill.userAvatar+"-"+currentSkill.title)
                        client.startHotword()
                        showHotword(); 
                    }
                    resolve([])
                })
            //})
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
      var buttonStyle = {position:'relative', backgroundColor:'grey' , border: '1px solid black', borderRadius: '2em', height: '3em', width: '3em', textDecoration: 'none', outline: 'none', padding: '0.2em'}
      var micbuttonStyle = {position:'relative', backgroundColor:(props.color ? props.color : 'grey') , border: '2px solid black', borderRadius: '2em', height: '3em', width: '3em', textDecoration: 'none', outline: 'none'}
      
      // restrict lines of chat history, if zero don't show
      var showChatHistory = true
      if (currentSkill && currentSkill.config  && currentSkill.config.chatHistory && currentSkill.config.chatHistory.trim() === '0') {
          showChatHistory = false
      } 
      
      // side app ?
      //var contentWidth = '100%' 
      //var contentFloat = 'none' //'right'
      var showSideApp = false
      //console.log(['check sideapp',currentSkill])
      if (currentSkill && currentSkill.config  && ((currentSkill.config.sideApp && currentSkill.config.sideApp.trim()) || (currentSkill.config.sideAppUrl && currentSkill.config.sideAppUrl.trim()))) {
          //contentWidth = '30%' 
          //contentFloat = 'right' //'right'
          showSideApp = true
      }
      
      
      const viewBlock = <div style={{position: 'relative', width:'100%'}} >
        {fullScreenVideo && <div><br/> <br/> <video ref={videoref} id="myVid" width="100%" >
            <source src={fullScreenVideo} />
            Sorry, your browser does not support HTML5 video.
        </video></div>}
       
       {(fullScreenYoutube && fullScreenYoutube.youtubeVideoId) && <div style={{width:'100%'}} ><br/><br/>  <YouTube 
           key={'yt-fs'} 
           videoId={fullScreenYoutube.youtubeVideoId}  
           opts={{
                width: '100%',
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
                
        {showSideApp && <iframe style={{width:'100%', height:window.innerHeight - 100, border:'none', overflow:'hidden'}} src={currentSkill && currentSkill.config && currentSkill.config.sideAppUrl ? currentSkill.config.sideAppUrl : ''}  />}</div>
      
        const historyBlock = <><div className="contentBlock"  >
        {<>
        
            {showChatHistory && <span style={{display:(ready ? 'block' : 'none')}} ><ChatUIComponent fullScreenVideo={fullScreenVideo} fullScreenYoutube={fullScreenYoutube} jsonhistory={JSON.stringify(history)} history={history}  sendUserMessage={sendUserMessage} /></span>}
     
            {!ready && <b style={{padding:'1em' , marginTop:'5em'}}>Loading</b>}
        </>}
        </div></>
      
    return <div id="chatcontainer" >
    <SizeMe>{({ size }) => 
    <Container fluid >
        <Row style={{marginLeft:'-30px', marginRight:'-30px'}} >
            <Col xs='12'  >
                <div style={{backgroundColor: (currentSkill && currentSkill.config && currentSkill.config.color) ? currentSkill.config.color : 'lightblue', width:'100%',border:'2px solid black', padding:'0.3em'}}>
                     <form onSubmit={function(e) {
                            e.preventDefault(); 
                            
                        }} >
                            
                
                 {props.showLogo !== false && (currentSkill && currentSkill.config && currentSkill.config.logo) && <img style={{height:'4em', marginRight:'1em'}}  src={currentSkill.config.logo} />}
                {props.showTextInput !== false && <input type='text' style={{marginRight:'1em',width:'25%'}} value={userMessage} placeholder={history.length === 0 ? 'Start a conversation': ''} 
                onKeyUp={function(e) {
                    if (e.keyCode === 13 && userMessage.trim().length > 0) {
                        sendUserMessage(userMessage)
                        setUserMessage('')
                    }
                }}  
                onChange={function(e) {setUserMessage(e.target.value)}} />}
                
                
                {props.showMicrophone !== false && <MicrophoneComponent onContextMenu={function(e) {disableAutoHotword()}} onClick={function(e) {toggleVoice()}} style={Object.assign({},micbuttonStyle,microphoneButtonStyle)} onMessage={function(message) {setUserMessage(message); sendUserMessage(message);}} />}
                
                {(props.showMute !== false &&  !mute) && <Button variant="primary" style={Object.assign({},buttonStyle,{marginLeft:'1em',marginRight:'1em',backgroundColor:'lightgreen',borderColor:'green'})}    onClick={function(e) {
                    setMute(true)
                }}><div ><svg style={{position: 'relative', width:'100%', top:'-5', left:'-1'}} viewBox="0 0 31 31">
                  <g
                     stroke="black"
                     strokeWidth="1"
                     fill="none"
                     fillRule="evenodd"
                     id="g8">
                    <path
                         style={{fill:'#000000',fillRule:'evenodd',stroke:'none',strokeWidth:1}}
                         id="path6"
                         d="M 6.0093689,15.068946 H 7.9906311 C 8.5480902,15.068946 9,15.504817 9,16.044457 v 7.847427 c 0,0.53876 -0.4433532,0.975512 -1.0093689,0.975512 H 6.0093689 C 5.4519098,24.867396 5,24.431524 5,23.891884 v -7.847427 c 0,-0.53876 0.4433532,-0.975511 1.0093689,-0.975511 z m 4.8355181,-0.526819 8.46047,-5.2754227 C 20.241282,8.6831193 21,9.088977 21,10.174567 v 19.587207 c 0,1.084984 -0.791093,1.541729 -1.755146,1.02648 L 10.881582,26.318412 C 10.394698,26.058191 10,25.411369 10,24.871729 v -8.827272 c 0,-0.53876 0.378645,-1.211611 0.844887,-1.50233 z"
                         />
                    </g>
                </svg></div></Button>}
                
                
                {(props.showMute !== false && mute) && <Button variant="primary" style={Object.assign({},buttonStyle,{marginLeft:'1em',  marginRight:'1em',backgroundColor:'lightpink',borderColor:'red'})}    onClick={function(e) {
                    setMute(false)
                }}><div ><svg style={{position: 'relative', width:'100%', top:'-5', left:'-1'}} viewBox="0 0 31 31" >
                  <g
                     stroke="black"
                     strokeWidth="1"
                     fill="none"
                     fillRule="evenodd"
                     id="g8">
                    <path
                       d="M26.8890873,18.5748798 L24.4142136,16.1000061 L23,17.5142197 L25.4748737,19.9890934 L23,22.4639671 L24.4142136,23.8781807 L26.8890873,21.403307 L29.363961,23.8781807 L30.7781746,22.4639671 L28.3033009,19.9890934 L30.7781746,17.5142197 L29.363961,16.1000061 L26.8890873,18.5748798 Z M6.0093689,15.0689455 L7.9906311,15.0689455 C8.54809015,15.0689455 9,15.5048168 9,16.0444571 L9,23.8918841 C9,24.4306443 8.55664682,24.8673958 7.9906311,24.8673958 L6.0093689,24.8673958 C5.45190985,24.8673958 5,24.4315245 5,23.8918841 L5,16.0444571 C5,15.5056969 5.44335318,15.0689455 6.0093689,15.0689455 Z M10.8448866,14.5421268 L19.3053568,9.26670427 C20.2412824,8.68311934 21,9.08897697 21,10.1745672 L21,29.761774 C21,30.8467578 20.2089071,31.3035027 19.244854,30.788254 L10.8815817,26.3184118 C10.3946976,26.0581912 10,25.4113695 10,24.8717291 L10,16.0444571 C10,15.5056969 10.3786449,14.8328461 10.8448866,14.5421268 Z"
                       fill="#000000"
                       id="path6" />
                  </g>
                </svg></div></Button>}
                
                {(fullScreenYoutube && fullScreenYoutube.youtubeVideoId) && 
                    <span style={{position: 'relative', height: '3em', width: '3em', top:'0.7em', marginLeft:'1em',  marginRight:'1em'}} onClick={function(e) {setFullScreenYoutube(null); setFullScreenVideo(null); if (audio) {audio.pause()}; audio = null}}>
                        <svg  viewBox="0 0 34 34 " x="0px" y="0px" style={{height: '3em', width: '3em'}}>
                        
                        <path
                         d="M 21.000009,30.000009 H 9.0000085 a 0.5,0.5 0 0 1 -0.35,-0.15 l -8.49999997,-8.49 A 0.5,0.5 0 0 1 8.527757e-6,21.000009 V 9.0000085 A 0.5,0.5 0 0 1 0.15000853,8.6500085 L 8.6400085,0.15000853 a 0.5,0.5 0 0 1 0.36,-0.150000002243 H 21.000009 a 0.5,0.5 0 0 1 0.35,0.150000002243 l 8.49,8.48999997 a 0.5,0.5 0 0 1 0.16,0.36 V 21.000009 a 0.5,0.5 0 0 1 -0.15,0.35 l -8.49,8.49 a 0.5,0.5 0 0 1 -0.36,0.16 z m -11.8000005,-1 H 20.800009 l 8.2,-8.2 V 9.2000085 l -8.2,-8.2 H 9.2000085 l -8.2,8.2 V 20.800009 Z"
                         id="path4617"
                         style={{fill:'#fa0010', fillOpacity:1, imageRendering:'auto' ,stroke:'#dc2500', strokeOpacity:1, opacity:1, strokeWidth:1.8, strokeMiterlimit:4, strokeDasharray:'none'}}  />
                      <text
                         style={{fontStyle:'normal', fontWeight:'normal', fontSize:'10.79994011px' , lineHeight:1.25, fontFamily:'sans-serif', letterSpacing:'0px', wordSpacing:'0px', fill:'#000000', fillOpacity:1, stroke:'none', strokeWidth:0.26999852}}
                         x="3.4542296"
                         y="15.328075"
                         id="text5172"
                         transform="scale(0.75898724,1.3175452)"><tspan
                           id="tspan5170"
                           x="3.4542296"
                           y="15.328075"
                           style={{fontStyle:'normal', fontVariant:'normal', fontWeight:'bold', fontStretch:'normal', fontSize:'10.79994011px', fontFamily:'sans-serif', fontVariantLigatures:'normal', fontVariantCaps:'normal', fontVariantNumeric:'normal', fontFeatureSettings:'normal', textAlign:'start', writingMode:'lr-tb', textAnchor:'start', strokeWidth:0.26999852}} >STOP</tspan></text>
                        
                        </svg>
                    </span>    
                }
                
                
                
                
                
                {props.showTrain === true && <Button variant="success"   onClick={function(e) {
                    //resetHistory()
                    trainChat()
                    //.then(function(welcomeResponse) {    
                        //setHistory({user:'',bot:welcomeResponse})
                    //})
                }}>{'Train'}</Button>}
                
              
                
                {(fullScreenYoutube && fullScreenYoutube.youtubeVideoId) && <Button  variant="danger"   onClick={function(e) {setFullScreenYoutube(null)}}>Stop</Button>}
                
                {(props.showFullscreen === true && currentSkill) && <Link to={"/skills/skill/"+currentSkill.title+"/chat"} ><Button variant="primary"  >{'Fullscreen'}</Button></Link>}
                
                {props.showReset === true && <Button onClick={resetHistory} >Reset</Button>}
        
                
       
                {(props.showHelp !== false  && currentSkill && currentSkill.config && currentSkill.config.helpText) && <span onClick={handleShow} style={{border: '2px solid black', borderRadius: '4em', marginLeft:'1em', width:'2em', height:'3em' , paddingLeft:'0.2em',paddingRight:'0em',paddingTop:'1em',paddingBottom:'0.8em'}}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 200 200 " x="0px" y="0px" style={{height: '3em', width: '3em'}}
                        width="180" height="180" 
                        >
                        <path fill="none" stroke="#000" strokeWidth="16" d="M60,67c0-13 1-19 8-26c7-9 18-10 28-8c10,2 22,12 22,26c0,14-11,19-15,22c-7,2-10,6-11,11v20m0,12v16"/>
                        </svg></span>}
                
                 {(currentSkill && currentSkill.config && currentSkill.config.enableChromeCastSideApp) && <span style={{height:'50px', width:'50px',float:'right'}}><google-cast-launcher  ></google-cast-launcher></span>}      
                 
                    </form>
                </div>
            </Col>
        </Row>
        
        <Row style={{marginLeft:'-30px', marginRight:'-30px'}}>
            {size.width >= breakpoint && <>
                <Col  xs='9' >{viewBlock}</Col>
                <Col  xs='3'   >{historyBlock}</Col>
            </>}
        
            {size.width < breakpoint && <>
                {(currentSkill && currentSkill.config  && currentSkill.config.sideAppAfterChat === true)  &&  <>
                    <Col xs='12'  >{historyBlock}</Col>
                    <Col xs='12' >{viewBlock}</Col>
                </>}
                {(!currentSkill || !currentSkill.config  || !(currentSkill.config.sideAppAfterChat === true))  && <>
                    <Col xs='12' >{viewBlock}</Col>
                    <Col xs='12'  >{historyBlock}</Col>                    
                </>}
            </>}
        
            
            
            
        </Row>
    </Container>
    }</SizeMe>
       
       
    
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>{(currentSkill && currentSkill.config && currentSkill.config.helpText) ? currentSkill.config.helpText  : ''}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
       
    </div>
}

export default ChatPage
