

Visit https://opennludata.org/ 


This tool helps voice developers build vocabularies for their applications by providing <b>import and export of various NLU training data formats</b>, and a <b>searchable database of community submitted, open licensed skills.</b>

<hr/>
        <h3>Features</h3>
        <ul>
            <li>Search for open licenced training data submitted by the community</li>
            <li>Import training data from text files, RASA , JOVO (Alexa, Google), Mycroft and native JSON.</li>
            <li>Edit training data and tag entities in intent examples</li>
            <li>Filtering, tagging, multiple selection and bulk operations to quickly collect training data into an exportable skill</li>
            <li>Virtual rendering with react-window is used to allow fast rendering of lists of intents and entities with many thousands of values</li>
            <li>Export training data suitable for RASA, JOVO and Mycroft</li>
            <li>Publish your skill to the community repository under an open source license</li>
        </ul>
        <ul>
            <li>This tool is a Progressive Web Application. Most features work without the Internet.</li>
            <li>MIT Open Source licensed code at <a target="_new" href="https://github.com/syntithenai/opennludata" >Github</a></li>
            <li>Cross platform nodejs server</li>
            <li>Published skills are committed to Github to ensure long term availability of collected data.</li>
            <li>To ensure ongoing availability, the web pages are hosted with github pages and the search interface relies on static data generated during publishing so a database/backend server is only required when publishing)</li>
             <li>When the Internet is available, <b>this site uses Google Analytics to measure engagement and improve future versions.</b> </li>
        </ul>
        



## Screenshots

Upload source documents

![sources](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/sources.png)

Annote entities in intents

![intents](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/intents.png)

Manage entity lists

![entities](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/entities.png)

Utterances and alternatives

![utterances](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/utterances.png)

Regular Expressions

![regex](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/regex.png)

Combine in all into a skill

![skill](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/skill.png)

Publish your skill

![publish](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/publish.png)

Search for skills in the community repository

![search](https://raw.githubusercontent.com/syntithenai/opennludata/master/docs/static/media/screenshots/search.png)





# BUGS
- sample regexps check format - not working local JS
- merge avoid dups


# TODO

- audio input
    - hotword picvoice /face recognise - https://github.com/justadudewhohacks/face-api.js#models-face-recognition
    - google asr
- public chat -= analytics

- youtube play muted 
- slot featurization
- predict use history slice ?
- mix entities - duplicate intents
- server side actions (select option python/js/node_=> export RASA


# WISHLIST

- actions/apis as tabs (remove multiselect ?)
- face id
- export RASA2 from stories/rules
    - pending 
        - wait for user input
        - entity roles and groups
        - checkpoints and OR
        - response with custom section including video/frame/...


- ace editor fullscreen
- image -add width, (Def 100%) link, description

- apis
  - wikipedia
  - hassio
  - jamendo
  - musicbrainz
  - ala animals
  - gmail/calendar
  - gdocs
  
- apis have packages => window scope  ?
  
- restrict form to two sequential tries of same slot before dropout
- goals - finish goal -> end conversation

- sizE limit on embedded response files

- external tts
- external nlu (+ service using nlp.js)
- external core routing  (+ service using nlp.js)
    
- interactive learning
- deploy
  - alexa endpoint/serverless
  - hermod
  - linux/pi
  - rasa

- import/export nlp.js
- auto remove duplicate tags on save

- docs 
    - opennlu format
    - actions and apis - available vars in scope
    - default actions
    - stories and rules
    
- log nlu and stories
- form as action ?
- OR in stories
- form tagall/deleteAll
- autotrain on changed
- rules/stories/forms tab with form select override finished action -> dialogman run form 
- skill settings - invocation, description
- api help text per function
- chromecast chat client

## BUGS

- skill entities editor sometimes no show placeholder text so invisible for selection of entity lists


"words-to-numbers": "^1.5.1",
    "youtube-api-search": "0.0.5"
    "chatui": "file:../chatui",
    "js-chess-engine": "^0.5.1",
    
