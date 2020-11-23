import {exportJOVOZip} from './exportJOVO'
import {exportJSONZip} from './exportJSON'
import {exportMycroftZip} from './exportMycroft'
import {exportRASAZip} from './exportRASA2'
import {exportNLPJS} from './exportNLPJS'
//import {exportRASAMDZip} from './exportRASAMD'
//import {exportRASAJSONZip} from './exportRASAJSON'
//import {exportRASAYmlZip} from './exportRASAYml'

var exportFormats = [
        {name:'JSON',exportFunction:exportJSONZip},
        {name:'nlp.js',exportFunction:exportNLPJS},
        {name:'JOVO',exportFunction:exportJOVOZip},
        {name:'Mycroft',exportFunction:exportMycroftZip},
        {name:'RASA',exportFunction:exportRASAZip},
        //{name:'RASA Markdown',exportFunction:exportRASAMDZip},
        //{name:'RASA JSON',exportFunction:exportRASAJSONZip},
        //{name:'RASA YML',exportFunction:exportRASAYmlZip}
    ]

export default exportFormats

