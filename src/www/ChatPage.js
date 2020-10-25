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

//var config={}
    
var meSpeak = window.meSpeak
            
function ChatPage(props) {
    var videoref = useRef(null)
    var [ready,setReady] = useState(false)
    var [chat,setChat] = useState(false)
    var [dm,setDm] = useState(null)
    var [mute,setMuteInner]  = useState(false)
    var [history, setHistory] = useState([])
    var [fullScreenVideo, setFullScreenVideo] = useState(null)
    //const {currentSkill} = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    var skillsEditor = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
    var currentSkill = props.currentSkill 
    if (!currentSkill) {
        currentSkill = skillsEditor.currentSkill
    }
    var d = null
    var audio  = null
    
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
    
    useEffect( () => {
        var lsMute = localStorage.getItem('mute_chat')
        setMuteInner(lsMute === 'true' ? true : false)
    },[])
       
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
                       if (audioFile.href && audioFile.autoplay === 'true') speechParts.push({audio:audioFile.href})
                    })
                   if (utterance && Array.isArray(utterance.video ))  utterance.video.map(function(videoFile) {
                       if (videoFile.href && videoFile.autoplay === 'true') speechParts.push({video:videoFile.href})
                    })
                    //
                })
                //console.log(['SPEECH parts',speechParts])
                
                speakSpeechParts(speechParts).then(function() {resolve()})
            }
            
            //function runRuleSteps(steps,utterances) {
                        //console.log(['RUN RULE STEPS',steps,utterances])
                        //return new Promise(function(iresolve,ireject) {
                            //if (Array.isArray(steps) && steps.length > 0) {
                                //var step = steps[0]
                                //runRuleStep(step,utterances).then(function(utterances) {
                                    ////utterances = newUtterances
                                    //console.log(['done  RUN RULEStep',utterances])
                                    //if (step && (step.indexOf('action ') === 0 || step.indexOf('utter ' === 0))) {
                                        //runRuleSteps(steps.slice(1),utterances).then(function(utterances) {iresolve(utterances)})
                                    //} else {
                                        //// invalid step (must be utter or action)
                                        //iresolve(utterances)
                                    //}
                                //})
                            //} else {
                                //// no more steps
                                //console.log(['RUN RULE STEPS DONE',utterances])
                                //iresolve(utterances)
                            //}
                        //})
                    //}
            
            function speakSpeechPart(part) {
                //console.log(['SPEECH audio st',part,mute])
                return new Promise(function(resolve,reject) {
                    var lsMute = localStorage.getItem('mute_chat')
                    if (lsMute === 'true') {
                        resolve()
                    } else {
                        meSpeak.stop();
                        //console.log(['SPEAK SPEECH parts',part.text])
                        if (part && part.text) {
                            meSpeak.speak(part.text,{},function() {
                                //console.log(['SPEECH speak called',part.text,part])
                                resolve()
                            })
                        } else if (part && part.audio) {
                            //console.log(['SPEECH audio',part.audio])
                            //meSpeak.speak(part.text,{},function() {
                                //console.log(['SPEECH speak called',part.text,part])
                                 audio = new Audio(part.audio);
                                 audio.onended = function() {
                                     //console.log(['SPEECH audio end'])
                                    resolve()
                                 }
                                 audio.loop = false;
                                 //console.log(['SPEECH audio play'])
                                 audio.play(); 
                                 
                            //})

                        } else if (part && part.video) {
                            //console.log(['SPEECH video',part.video,videoref])
                            
                                setFullScreenVideo(part.video)
                                if (videoref && videoref.current) {
                                    videoref.current.onended = function() {
                                        //console.log(['SPEECH video end'])
                                        setFullScreenVideo(null)
                                        resolve()
                                    }
                                    //console.log('VIDCURR')
                                    videoref.current.play()
                                    
                                    //setFullScreenVideo(null)
                                }
                        } else {
                            resolve()
                        }
                    }
                })
            }
            
            function speakSpeechParts(speechPartsParam) {
                //console.log(['SPEAK SPEECH parts',speechPartsParam])
                return new Promise(function(iresolve,ireject) {
                    var lsMute = localStorage.getItem('mute_chat')
                    if (lsMute === 'true') {
                        resolve()
                    } else {
                        //console.log(['AASPEAK SPEECH parts',speechPartsParam,speechPartsParam[0],speechPartsParam[0].text])
                        if (speechParts.length > 0) {
                            speakSpeechPart(speechPartsParam[0]).then(function() {
                                var newParts = speechPartsParam.slice(1)
                                //console.log(['SPEECH speak called new',newParts])
                                if (newParts.length > 0 && !mute) {
                                    console.log(['SPEECH speak called recurseive',newParts])
                                    speakSpeechParts(newParts).then(function() {
                                        //console.log(['DONE SPEAK SPEECH parts'])
                                        iresolve()
                                    })
                                } else {
                                    //console.log(['DONE SPEAK SPEECH parts'])
                                    iresolve()
                                }
                            })
                        } else {
                            //console.log(['DONE SPEAK SPEECH parts'])
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
        return new Promise(function(resolve,reject) {
                //console.log(['dm msg',message])
                if (dm && dm.run) {
                    //console.log(['dm msg send',message])
                    return dm.run(message).then(function(response) {
                        //console.log(['RES',response])
                        speakBotResponse(response)
                        var newHistory = history
                        newHistory.push({user:message,bot:response})
                        setHistory(newHistory)
                        resolve(response)
                    })
                } else {
                    resolve()
                }
        })
    }
      
    function trainChat() {
        return new Promise(function(resolve,reject) {
            console.log(['TRAIN',JSON.parse(JSON.stringify(currentSkill))])
            
            exportJSON(currentSkill).then(function(config) {
                d = DialogManager(config ? config : {})
            
                d.init().then(function(botWelcome) {
                    //console.log(['TRAIN dm initied',d,botWelcome])
                    //setChat(sendUserMessage)
                    setDm(d)
                    var newHistory = []
                    newHistory.push({user:'',bot:botWelcome})
                    setHistory(newHistory)
                    //resolve(response)
                    setReady(true)
                    speakBotResponse(botWelcome)
                    resolve()
                })
            })
        })
    }  
         
    //console.log(['DM',d,ready,config])
    useEffect(() => {
        //function sendUserMessage(message) {
            //console.log(['dm send msg',message])
            //return new Promise(function(resolve,reject) {
                    //console.log(['dm msg',message])
                    //return d.run(message).then(function(response) {
                        //console.log(['RES',response])
                        //resolve(response)
                    //})
            //})
        //}
        if (currentSkill) {
            
            trainChat()
        }
    },[currentSkill])

    
    
  return <div>
      {( !props.hideBackLink) && <Link to={"./"} ><Button variant="warning" style={{float:'right'}}  >{'Back to Skill'}</Button></Link>}  
        
        {<Button variant="success" style={{float:'left'}}  onClick={function(e) {
            trainChat()
        }}>{'Train'}</Button>}
        
         {!mute && <Button variant="primary" style={{float:'right'}}  onClick={function(e) {
            setMute(true)
        }}>{'Mute'}</Button>}
        {mute && <Button variant="primary" style={{float:'right'}}  onClick={function(e) {
            setMute(false)
        }}>{'Unmute'}</Button>}
        
        {fullScreenVideo && <div><br/> <br/> <video ref={videoref} id="myVid" width="100%" >
            <source src={fullScreenVideo} />
            Sorry, your browser does not support HTML5 video.
        </video></div>}
       
        {!fullScreenVideo && <>
        
        
      
      DM{dm && JSON.stringify(dm.history)}
       LOCAL{JSON.stringify(history)}
    {<span style={{display:(ready ? 'block' : 'none')}} ><ChatUIComponent history={history}  sendUserMessage={sendUserMessage} /></span>}
    {!ready && <b style={{padding:'1em' , paddingTop:'5em'}}>Loading</b>}
      </>}
    </div>
}

export default ChatPage
//JSON.stringify(dm ? [].concat(dm.chatHistory,
//SK {JSON.stringify(currentSkill)} || : [])
 

 
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
