import { generateObjectId } from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'

// just the models subfolder
// one file per intent
// one file per entity
function exportJOVO(skill) {
    //var modelFiles=[]
    var cleanEntities = {}
    if (skill.entities) {
        skill.entities.map(function(entity,entityKey) {
            cleanEntities[entityKey] = entity
            return null
        })
    }
    var cleanIntents = {}
    if (skill.intents) {
        skill.intents.map(function(intent,intentKey) {
            cleanIntents[intentKey] = intent
            return null
        })
    }
    var cleanSkill = {title:skill.title, friendlyTitle: skill.friendlyTitle, intents: Object.values(cleanIntents) , entities: Object.values(cleanEntities)}
    var title = skill.friendlyTitle ? skill.friendlyTitle+'.json'  : (skill.title ? skill.title+'.json' : generateObjectId()+'.json') 
    var content = JSON.stringify(cleanSkill)
    //console.log(['EXPORT json',content])
    
    return createZip(title,{files:[{name:title, content: content}]})
    
}


function exportJOVOZip(skill) {
    return createZip({files:[{name:'skill.json', content: exportJOVO(skill)}]})
}

export {exportJOVO, exportJOVOZip}
