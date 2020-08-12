import {exportJOVOZip} from './exportJOVO'
import {exportJSONZip} from './exportJSON'
import {exportMycroftZip} from './exportMycroft'
import {exportRASAZip} from './exportRASA'

var exportFormats = [
        {name:'JSON',exportFunction:exportJSONZip},
        {name:'JOVO',exportFunction:exportJOVOZip},
        {name:'RASA',exportFunction:exportRASAZip},
        {name:'Mycroft',exportFunction:exportMycroftZip}
    ]

export default exportFormats

