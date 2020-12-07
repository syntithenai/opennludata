const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const config = require('./config')
var stream = require('stream') 
var VAD= require('node-vad')
    
function getIbmDetector(connection ,logTranscription, skillId) {
    const vad = new VAD(VAD.Mode.NORMAL);

    var lastAudio = new Date().getTime()
    const voice = {START: true, STOP: false};
    let state = voice.START;
	var finished = false
    var startTime = new Date().getTime()
	var closed = false		
    var startTimeout = setTimeout(function() {
            console.log('START TIMEOUT')
            bailout('start timeout')
    },2000)
        
    
    function bailout(a) {
        finished = true
	    if (detector)  {
            detector.push(null) //JSON.stringify({action: 'stop'}))
        }
        if (connection) {
            console.log('close connection')
            connection.close()
        }
    }
    
    
    
    let start = new Date()
    const speechToText = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        apikey: config && config.websocketAsr && config.websocketAsr.ibmApiKey ? config.websocketAsr.ibmApiKey : '',
      }),
      serviceUrl: config && config.websocketAsr && config.websocketAsr.ibmUrl ? config.websocketAsr.ibmUrl : '',
      //headers: {
        //'X-Watson-Learning-Opt-Out': 'true'
      //}
    });
    const params = {
      contentType: "audio/l16;rate=16000;channels=1",
    };
    const recognizeStream = speechToText.recognizeUsingWebSocket(params);
    
    recognizeStream.on('data', function (event) {
        var transcript = event.toString()
        console.log(['ibm recog data',transcript])
        if (transcript && transcript.trim()) {
            closed = true
            connection.sendUTF(JSON.stringify({transcript: transcript}))
            console.log(['ibm sent transcript',transcript])
            let time = new Date().getTime() - startTime;
            console.log('Transcript complete in '+time/1000+' seconds')
            logTranscription({skill:skillId, type:'ibm', transcript:transcript, duration: time/1000})
            connection.close()
        }
    });
    recognizeStream.on('error', function (event) {
        closed = true
        console.log(['ibm recog error']) //,JSON.stringify(event, null, 2)])
        console.log(event)
        bailout('connection error')
    });
    recognizeStream.on('close', function (event) {
        closed = true
        console.log(['ibm close']) //,JSON.stringify(event, null, 2)])
        bailout('connection closed')
    });
    recognizeStream.on('finish', function (event) {
        closed = true
        console.log(['ibm fin']) //,JSON.stringify(event, null, 2)])
    });
    
    const detector = new stream.Transform({
        transform(chunk, encoding, callback) {
            //console.log('transform');
            //this.push(chunk)
            if (chunk === null) {
                //connection.sendUTF(JSON.stringify({message: 'force end detection with null chunk'}))
                //bailout('empty chunk')
                if (!finished && !closed) this.push(chunk)
                callback()
            } else {
                try {
                    vad.processAudio(chunk, 16000).then(res => {
                        switch (res) {
                            case VAD.Event.ERROR:
                                break;
                            case VAD.Event.SILENCE:
                                //console.log(['dwrtite silence',silenceCount, finished])
                                if (!finished && !closed) {
                                    var now = new Date().getTime()
                                    //console.log('should silence TO',(now - lastAudio))
                                    if (state === voice.START && (now - lastAudio > 800)) { //30
                                        state = voice.STOP;
                                        try {
                                            //bailout('silence')
                                            this.push(null)
                                        } catch (e) {
                                            console.log(e)
                                            bailout('error finishing stream')
                                        }
                                    } else {
                                        //console.log('push chunk');
                                        try {
                                            this.push(chunk)
                                        } catch (e) {
                                            console.log(e)
                                        }
                                        //recognizeStream.write(chunk)
                                    }
                                }
                                break;
                            case VAD.Event.VOICE:
                            case VAD.Event.NOISE:
                                if (startTimeout) clearTimeout(startTimeout);
                                    
                                if (!finished && !closed) {
                                    state = voice.START;
                                            
                                    try {
                                        lastAudio = new Date().getTime()
                                        //console.log('push silence');
                                        this.push(chunk)
                                        //recognizeStream.write(chunk)
                                    } catch (e) {
                                        console.log(e)
                                        bailout('error finishing stream 2')
                                    }
                                }
                                break;
                        }
                        callback()
                    });
                    //callback()
                } catch (e) {
                    console.log(['STREAM ERROR',e])
                    bailout('error finishing stream 3')
                    callback()
                }
            }
        
            
            
            //console.log(chunk.toString());
            //callback();
        }
    });
    
    //let detector = new stream.Writable();
    //detector._write = function(chunk,encoding,cb) {
        //if (chunk === null) {
            ////connection.sendUTF(JSON.stringify({message: 'force end detection with null chunk'}))
            //bailout('empty chunk')
        //} else {
            //try {
                //vad.processAudio(chunk, 16000).then(res => {
                    //switch (res) {
                        //case VAD.Event.ERROR:
                            //break;
                        //case VAD.Event.SILENCE:
                            ////console.log(['dwrtite silence',silenceCount, finished])
                            //if (!finished) {
                                //var now = new Date().getTime()
                                ////console.log('should silence TO',(now - lastAudio))
                                //if (state === voice.START && (now - lastAudio > 800)) { //30
                                    //state = voice.STOP;
                                    //try {
                                        //bailout('silence')
                                    //} catch (e) {
                                        //bailout('error finishing stream')
                                    //}
                                //} else {
                                    //recognizeStream.write(chunk)
                                //}
                            //}
                            //break;
                        //case VAD.Event.VOICE:
                        //case VAD.Event.NOISE:
                            //if (startTimeout) clearTimeout(startTimeout);
                                
                            //if (!finished) {
                                //state = voice.START;
                                        
                                //try {
                                    //lastAudio = new Date().getTime()
                                    //recognizeStream.write(chunk)
                                //} catch (e) {
                                    //console.log(e)
                                    //bailout('error finishing stream 2')
                                //}
                            //}
                            //break;
                    //}
                //});
                //cb()
            //} catch (e) {
                //console.log(['STREAM ERROR',e])
                //bailout('error finishing stream 3')
            //}
        //}
    
    //}
   
    detector.pipe(recognizeStream)
    
    
    
    //// Stream the audio to the Google Cloud Speech API
    //var detector = client
      //.streamingRecognize(speechRequest)
      //.on('error', console.log)
      //.on('data', data => {
        //detector.pause()
        //detector.destroy()
        //console.log(['TRANSCRIPT',(data && data.results && data.results[0] && data.results[0].alternatives && data.results[0].alternatives[0]  && data.results[0].alternatives[0].transcript) ?  data.results[0].alternatives[0].transcript : "NOTRANSCRIPT"])
        //// send results to web client
        //if (data && data.results && data.results[0] && data.results[0].alternatives && data.results[0].alternatives[0]  && data.results[0].alternatives[0].transcript && data.results[0].alternatives[0].transcript.trim()) {
            //connection.sendUTF(JSON.stringify({transcript: data.results[0].alternatives[0].transcript}))
            //let time = new Date().getTime() - start.getTime();
            //console.log('Transcript complete in '+time/1000+' seconds')
            //logTranscription({skill:skillId, type:'google', transcript:data.results[0].alternatives[0].transcript, duration: time/1000})
            //connection.close()
        //}
    //});
    return detector
}
module.exports = getIbmDetector


