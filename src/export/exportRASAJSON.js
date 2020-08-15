import { generateObjectId , uniquifyArray} from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'

// just the models subfolder
// one file per intent
// one file per entity
function exportRASAJSON(skill) {
    return new Promise(function(resolve,reject) {
        //var modelFiles=[]
        //var cleanEntities = {}
        //if (skill.entities) {
            //skill.entities.map(function(entity,entityKey) {
                //cleanEntities[entityKey] = entity
                //return null
            //})
        //}
        //var cleanIntents = {}
        console.log(['EXP RASAS',skill])
        var nluOut=[]
        
        //{
    //"rasa_nlu_data": {
        //"common_examples": [],
        //"regex_features" : [],
        //"lookup_tables"  : [],
        //"entity_synonyms": []
    //}
//}
//{"rasa_nlu_data":{"regex_features":[],"entity_synonyms":[{"synonyms":["biggest city","capital city"],"value":"capital"}],"common_examples":[{"text":"sounds good sounds good thank you","intent":"affirmative","entities":[]},
      
      
      //{"text":"what is the use of a actinometer","intent":"ask_attribute","entities":[{"end":15,"entity":"attribute","start":12,"value":"use"},{"end":32,"entity":"thing","start":21,"value":"actinometer"}]}
        
        if (skill.intents) {
            Object.keys(skill.intents).map(function(intentKey) {
                const intent = skill.intents[intentKey]
                nluOut.push('## intent:'+intentKey)
                uniquifyArray(intent).sort().map(function(intentItem) {
                    nluOut.push('- '+intentItem.example)
                }) 
                nluOut.push("\n")
                return null
            })
        }
        //var cleanSkill = {title:skill.title, friendlyTitle: skill.friendlyTitle, intents: Object.values(cleanIntents) , entities: Object.values(cleanEntities)}
        //var title = skill.friendlyTitle ? skill.friendlyTitle+'.json'  : (skill.title ? skill.title+'.json' : generateObjectId()+'.json') 
        
//## intent:what_can_i_say
//- what can i say
//- help
        //if (skill.i
        var content = nluOut.join("\n")
        //console.log(['EXPORT json',content])
        resolve({files:[{name:'nlu.md', content: content}]})
    })
}


function exportRASAJSONZip(skill) {
    return new Promise(function(resolve,reject) {
        exportRASAJSON(skill).then(function(data) {
            createZip(data).then(function(res) {
                resolve(res)
            })
        })
    })
}

export {exportRASAJSON, exportRASAJSONZip}
