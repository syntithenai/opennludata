// export GOOGLE_APPLICATION_CREDENTIALS=./google-service-creds-opennlu.json;  bash bin/dev_api.sh


const speech = require('@google-cloud/speech');
//require('dotenv').config()
function getGoogleDetector(connection ) {
    // Creates a speech recognition client
    const client = new speech.SpeechClient();
    const encoding = 'LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-AU';
    const speechRequest = {
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
      interimResults: false, // If you want interim results, set this to true
    };

    // Stream the audio to the Google Cloud Speech API
    var detector = client
      .streamingRecognize(speechRequest)
      .on('error', console.log)
      .on('data', data => {
        //console.log(['TRANSCRIPT',(data && data.results && data.results[0] && data.results[0].alternatives && data.results[0].alternatives[0]  && data.results[0].alternatives[0].transcript) ?  data.results[0].alternatives[0].transcript : "NOTRANSCRIPT"])
        detector.pause()
        detector.destroy()
        // send results to web client
        if (data && data.results && data.results[0] && data.results[0].alternatives && data.results[0].alternatives[0]  && data.results[0].alternatives[0].transcript && data.results[0].alternatives[0].transcript.trim()) {
            connection.sendUTF(JSON.stringify({transcript: data.results[0].alternatives[0].transcript}))
            connection.close()
        }
    });
    return detector
}
module.exports = getGoogleDetector
