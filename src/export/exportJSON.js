import { generateObjectId } from '../utils';
import {createZip} from './createZip'
import localforage from 'localforage'

function exportJSON(skill) {
    console.log(['EXPPORT JSON',skill])
     var listsStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "lists",
     });
     listsStorage.getItem('alldata').then(function(lists) {
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
        skill.lists = skillLists
    })
    return JSON.stringify(skill)
}

function exportJSONZip(skill) {
    return createZip({files:[{name:'skill.json', content: exportJSON(skill)}]})
}

export {exportJSON, exportJSONZip}
