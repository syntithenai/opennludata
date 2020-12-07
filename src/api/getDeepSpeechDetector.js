
var stream = require('stream') 
var Writable = stream.Writable;
var VAD= require('node-vad')
const Ds = require('deepspeech');
var config = require('./config')

function getDeepSpeechModel() {
    console.log(['Load Deepspeech'])
    //,JSON.stringify(config,false,2)])
    let start = new Date()
    
    var model = new Ds.Model(config && config.websocketAsr && config.websocketAsr.deepspeechModel ? config.websocketAsr.deepspeechModel : './deepspeech/deepspeech-0.9.1-models.pbmm');
    model.enableExternalScorer(config && config.websocketAsr && config.websocketAsr.deepspeechScorer ? config.websocketAsr.deepspeechScorer : './deepspeech/deepspeech-0.9.1-models.scorer');
    let time = new Date().getTime() - start.getTime();
    console.log('Loaded Deepspeech in '+time/1000+' seconds')
    return model
}

function getDeepSpeechDetector(connection,model,logTranscription, skillId) {
    
    var startTimeout = null
    
	function getDetector(connection,model) {
        let start = new Date()
		const vad = new VAD(VAD.Mode.NORMAL);
		const voice = {START: true, STOP: false};
		let state = voice.START;
		var sctx = model.createStream();
		var finished = false
		let detector = new Writable();
		var silenceCount = 0;
        var lastAudio = new Date().getTime()
        
        function bailout(a) {
            console.log(['BAILOUT',a])
            if (sctx) {
                let transcription = sctx.finishStream();
                finished = true
                let time = new Date().getTime() - start.getTime();
                console.log('Transcript complete in '+time/1000+' seconds')
                if (transcription) {
                    connection.sendUTF(JSON.stringify({transcript: transcription, time: time}))
                    logTranscription({skill:skillId, type:'deepspeech', transcript:transcription, duration: time/1000})
                }
                console.log(transcription)
            }
            if (startTimeout) clearTimeout(startTimeout)
            if (sctx) Ds.FreeStream(sctx)
            if (connection) connection.close()
        }
        
        //var startTimeout = null
        //setTimeout(function() {
            //console.log('START TIMEOUT')
            ////connection.sendUTF(JSON.stringify({error: 'no packet timeout'}))
            //bailout('start timeout')
        //},2000)
        
		detector._write = function(chunk,encoding,cb) {
            if (chunk === null) {
                connection.sendUTF(JSON.stringify({message: 'force end detection with null chunk'}))
                bailout('empty chunk')
            } else {
                try {
                    vad.processAudio(chunk, 16000).then(res => {
                        if (startTimeout) clearTimeout(startTimeout);
                        switch (res) {
                            case VAD.Event.ERROR:
                                break;
                            case VAD.Event.SILENCE:
                                //console.log(['dwrtite silence',silenceCount, finished])
                
                                silenceCount++;
                                if
                                 (!finished) {
                                    var now = new Date().getTime()
                                    console.log('should silence TO',(now - lastAudio))
                                    if (state === voice.START && (now - lastAudio > 800)) { //30
                                        state = voice.STOP;
                                        silenceCount = 0;
                                        bailout('silence')
                                        
                                    } else {
                                       // lastAudio = new Date().getTime()
                                        sctx.feedAudioContent(chunk);
                                    }
                                }
                                break;
                            case VAD.Event.VOICE:
                            case VAD.Event.NOISE:
                                //console.log(['dwrtite sound'])
                                //if (startTimeout) clearTimeout(startTimeout)
                                silenceCount = 0;
                                state = voice.START;
                                    
                                if (!finished) {
                                    // restart mic
                                    try {
                                        lastAudio = new Date().getTime()
                                        sctx.feedAudioContent(chunk)
                                    } catch (e) {
                                        console.log(e)
                                        connection.sendUTF(JSON.stringify({error: e.toString()}))
                                        bailout('error finishing stream 2')
                                    }
                                }
                                break;
                        }
                    });
                    cb()
                } catch (e) {
                    console.log(['STREAM ERROR',e])
                    connection.sendUTF(JSON.stringify({error: e.toString()}))
                    bailout('error finishing stream 3')
                }
            }
		}
		return detector
	}
    // singleton 
    return getDetector(connection,model)
}

module.exports = {getDeepSpeechDetector,getDeepSpeechModel}
    
    //function onAudioMessage(buffer) {
		//console.log('audio message ',buffer)
		//if (mqttStreams.hasOwnProperty(siteId)) {
		////console.log('audio message2 ',siteId)
			//// wait for first voice before starting to push audio packets to detector
			//if (!this.isStarted) {
				//const vad = new VAD(VAD.Mode.NORMAL);
				//console.log('start listening ',buffer)
				
				//// push into stream buffers for the first time (and start timeout)
				//function pushBuffers(siteId,buffer) {
					//if (that.isStarted) mqttStreams[siteId].push(buffer)
					//if (that.isStarted) audioDump[siteId].push(buffer)	
				//}
				
				//vad.processAudio(buffer, 16000).then(res => {
					//switch (res) {
						//case VAD.Event.ERROR:
							//break;
						//case VAD.Event.SILENCE:
						//console.log('silence')
							//pushBuffers(siteId,buffer)
							//break;
						//case VAD.Event.NOISE:
							//console.log('noise')
							//pushBuffers(siteId,buffer)
							//break;
						//case VAD.Event.VOICE:
							//console.log('voice')
							//that.isStarted = true;     
							//pushBuffers(siteId,buffer)
							//// timeout once voice starts
							//console.log(['TIMEOUT ADD',config.services.HermodDeepSpeechAsrService.timeout])
							//clearTimeout(that.startTimeouts[siteId] )
							//that.asrTimeouts[siteId] = setTimeout(function() {
								//console.log('TIMEOUT FORCE END')
								//that.finishStream(siteId)
							//},config.services.HermodDeepSpeechAsrService.timeout);
							
							//break;
					//}
				//})
				
			//} else {
				//if (that.isStarted) mqttStreams[siteId].push(buffer)
				//if (that.isStarted) audioDump[siteId].push(buffer)	
			//}
		//}
	//}	
	
	//function getAsrModel() {
		//const BEAM_WIDTH = config.services.HermodDeepSpeechAsrService.BEAM_WIDTH;
		//const N_FEATURES = config.services.HermodDeepSpeechAsrService.N_FEATURES;
		//const N_CONTEXT = config.services.HermodDeepSpeechAsrService.N_CONTEXT;
        
        //const LM_ALPHA = config.services.HermodDeepSpeechAsrService.LM_ALPHA;
		//const LM_BETA = config.services.HermodDeepSpeechAsrService.LM_BETA;
		
        
		//var args = config.services.HermodDeepSpeechAsrService.files;
		
		//console.error('Loading model from file %s', args['model']);
		//const model_load_start = process.hrtime();
		//let model = new Ds.Model(args['model'], N_FEATURES, N_CONTEXT, args['alphabet'], BEAM_WIDTH);
		//const model_load_end = process.hrtime(model_load_start);
		//console.error('Loaded model in %ds.', this.totalTime(model_load_end));

		//if (args['lm'] && args['trie']) {
			//console.error('Loading language model from files %s %s', args['lm'], args['trie']);
			//const lm_load_start = process.hrtime();
			//model.enableDecoderWithLM(args['alphabet'], args['lm'], args['trie'],
				//LM_ALPHA, LM_BETA);
			//const lm_load_end = process.hrtime(lm_load_start);
			//console.error('Loaded language model in %ds.', this.totalTime(lm_load_end));
		//}
		
		//return model;
	//}
    
     

           
    //var siteId='standalone'

    //let mqttStreams = {};
//let audioDump = {};
        				

       //this.callbackIds = {};
		//this.listening = {};
		//this.silent = {};
		//this.asrTimeouts={}
		//this.startTimeouts={}
		//this.sctx = {}
		//this.models = {}
		//this.isStarted = false;
		//let eventFunctions = {
		
        //}
        

    // Creates a speech recognition client
    //const client = new speech.SpeechClient();
    //const encoding = 'LINEAR16';
    //const sampleRateHertz = 16000;
    //const languageCode = 'en-AU';
    //const speechRequest = {
      //config: {
        //encoding: encoding,
        //sampleRateHertz: sampleRateHertz,
        //languageCode: languageCode,
      //},
      //interimResults: false, // If you want interim results, set this to true
    //};

    //// Stream the audio to the Google Cloud Speech API
    //var detector = client
      //.streamingRecognize(speechRequest)
      //.on('error', console.log)
      //.on('data', data => {
        //console.log(['TRANSCRIPT',(data && data.results && data.results[0] && data.results[0].alternatives && data.results[0].alternatives[0]  && data.results[0].alternatives[0].transcript) ?  data.results[0].alternatives[0].transcript : "NOTRANSCRIPT"])
        //detector.pause()
        //detector.destroy()
        //// send results to web client
        //if (data && data.results && data.results[0] && data.results[0].alternatives && data.results[0].alternatives[0]  && data.results[0].alternatives[0].transcript && data.results[0].alternatives[0].transcript.trim()) {
            //connection.sendUTF(JSON.stringify({transcript: data.results[0].alternatives[0].transcript}))
        //}
    //});
