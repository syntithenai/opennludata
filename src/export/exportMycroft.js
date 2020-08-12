import { generateObjectId } from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'


// just the models subfolder
// one file per intent
// one file per entity
function exportMycroft(skill) {
    var modelFiles=[]
    var listsStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "lists",
     });
     listsStorage.getItem('alldata').then(function(lists) {
        console.log(['GOTDATA',lists])
         //if (err) throw new Error(err)
        //var itemsManager = useDBSingleKey('nlutool','lists','alldata')
        //itemsManager.loadAll()
        var usedLists = {}
        if (skill.entities) {
            Object.keys(skill.entities).map(function(entity,i) {
                if (skill.entities[entity] && Array.isArray(skill.entities[entity].lists)) {
                    skill.entities[entity].lists.map(function(list) {
                       usedLists[list] = true  
                    })
                }
            })
        }
        console.log(['USELISTS',usedLists])
       
        var skillLists = {}
        Object.keys(usedLists).map(function(listKey) {
          skillLists[listKey] = []  
        })
       
       
        lists.map(function(item) {
            Object.keys(usedLists).map(function(listKey) {
                if (item && item.tags && item.tags.indexOf(listKey) !== -1) {
                    skillLists[listKey].push(item.value)
                }
            })
        })
         console.log(['SKILLLISTS',skillLists])
        //Object.keys(usedLists).map(function(list) {
              //skillLists[list] = lists.filter(function(item) {
                 //if (item && item.tags && item.tags.indexOf(list) !== -1) return true
                 //else return false  
              //}).map(function(item) {
                 //return item.value  
              //})
        //});
        skill.lists = skillLists
        console.log(['EXPPORT JSON with lists',skill])
    })
    //var cleanIntents = {}
    //if (skill.intents) {
        //skill.intents.map(function(intent,intentKey) {
            //cleanIntents[intentKey] = intent
            //return null
        //})
    //}
    //var cleanSkill = {title:skill.title, friendlyTitle: skill.friendlyTitle, intents: Object.values(cleanIntents) , entities: Object.values(cleanEntities)}
    //var title = skill.friendlyTitle ? skill.friendlyTitle+'.json'  : (skill.title ? skill.title+'.json' : generateObjectId()+'.json') 
    //var content = JSON.stringify(skill)
    ////console.log(['EXPORT json',content])
    console.log(["GENZIP",JSON.stringify(skill)])
        
    
    return JSON.stringify(modelFiles)
}


function exportMycroftZip(skill) {
    return createZip({files:[exportMycroft(skill)]})
}

export {exportMycroft, exportMycroftZip}

