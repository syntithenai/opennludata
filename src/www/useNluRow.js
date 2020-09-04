import React, {useState, useEffect} from 'react'
import {findFirstDiffPos, uniquifyArray, uniquifyArrayOfObjects } from './utils'
function useNluRow(item, saveItem, splitNumber, style, setPageMessage) {
    const [selectionState, setSelectionState] = useState({})
    const [newEntity, setNewEntity] = useState('')
    const [intentTitle, setIntentTitle] = useState(item && item.intent ? item.intent : '')
    // for ReactTags format using objects
    const [tags, setTags] = useState([])
    const [skills, setSkills] = useState([])
    //console.log(['USENLUROW',splitNumber])
    const reactTags = React.createRef()
    const reactSkills = React.createRef()
     // tags
    useEffect(() => {
        if (item.tags) setTags(item.tags.map(function(tag,i) {return {id:i, name:tag}}))
        if (item.skills) setSkills(item.skills.map(function(skill,i) {return {id:i, name:skill}}))
    },[item])

     function onTagDelete (i) {
        const newTags = tags.slice(0)
        newTags.splice(i, 1)
        setTags(newTags)
        var newItem = item
        newItem.tags = newTags.map(function(newTag) { return newTag.name})
        saveItem(newItem,splitNumber)
      }
     
     function onTagAddition (tag) {
        if (tag && tag.name.trim().length > 0) {
            const newTags = [].concat(tags, tag)
            setTags(uniquifyArrayOfObjects(newTags,'name').sort(function(a,b) {if (a.name > b.name) return 1; else return -1} ))
            var newItem = item
            newItem.tags = uniquifyArray(newTags.map(function(newTag) { return newTag.name})).sort()
            saveItem(newItem,splitNumber)
        }
      }
      
      function onSkillDelete (i) {
        const newSkills = skills.slice(0)
        newSkills.splice(i, 1)
        setSkills(newSkills)
        var newItem = item
        newItem.skills = newSkills.map(function(newSkill) { return newSkill.name})
        saveItem(newItem,splitNumber)
      }
     
     function onSkillAddition (skill) {
         if (skill && skill.name.trim().length > 0) {
            const newSkills = [].concat(skills, skill)
            setSkills(uniquifyArrayOfObjects(newSkills,'name').sort(function(a,b) {if (a.name > b.name) return 1 ;else return -1} ))
            var newItem = item
            newItem.skills = uniquifyArray(newSkills.map(function(newSkill) { return newSkill.name})).sort()
            saveItem(newItem,splitNumber)
        }
     }
    
        
    function createSelection(field, start, end) {
        if (field) {
            if( field.createTextRange ) {
                var selRange = field.createTextRange();
                selRange.collapse(true);
                selRange.moveStart('character', start);
                selRange.moveEnd('character', end-start);
                selRange.select();
            } else if( field.setSelectionRange ) {
                field.setSelectionRange(start, end);
            } else if( field.selectionStart ) {
                field.selectionStart = start;
                field.selectionEnd = end;
            }
            field.focus();
        }
    }
    
    function updateExampleContent(content) {
        //console.log('UPDTEXT')
        if (item && typeof item.example === "string" && typeof content === "string") {
            //console.log('UPDTEXTREAL')
            const newItem = JSON.parse(JSON.stringify(item));
            if (item.entities && item.entities.length > 0) {
                var entities = item.entities
                // deal with entity ranges * allow for delete multiple
                const diffPos = findFirstDiffPos(content,item.example)
                // insertion
                if (content.length - item.example.length > 0) {
                    
                    //console.log('UPDTEXT insert')
                    const insertionLength = content.length - item.example.length
                    // update start and end subtract deletionLength
                    newItem.entities = entities.map(function(entity,entityIndex) {
                        if (diffPos < entity.start) {
                            entity.start += insertionLength
                            entity.end += insertionLength;
                        } else if (diffPos < entity.end) {
                            // update entity value
                            entity.end += insertionLength;
                            entity.value = content.slice(entity.start,entity.end)
                        }
                        return entity 
                    })
                // replace    
                } 
                else if (content.length === item.example.length) {
                    //console.log('UPDTEXT replace')
                    // check if was inside an entity and update value as required
                    newItem.entities = entities.map(function(entity,entityIndex) {
                        if (diffPos >= entity.start && diffPos < entity.end) {
                            // update entity value
                            entity.value = content.slice(entity.start,entity.end)
                        }
                        return entity 
                    })
                // deletion
                } else {
                    //console.log('UPDTEXT delete')
                    const deletionLength = content.length - item.example.length
                    // update start and end subtract deletionLength
                    newItem.entities = entities.map(function(entity,entityIndex) {
                        if (diffPos < entity.start) {
                            entity.start += deletionLength
                            entity.end += deletionLength;
                        } else if (diffPos < entity.end) {
                            // update entity value
                            entity.end += deletionLength;
                            entity.value = content.slice(entity.start,entity.end)
                        }
                        return entity 
                    })
                }
            }
            newItem.example = content;
            saveItem(newItem,splitNumber)
        }
    }
    
    function entityClicked(entityKey,entityType) {
        if (item.entities)  {
            var entities = item.entities
            if (! selectionState || !selectionState.textSelection || selectionState.textSelection.length === 0) {
                // select text in string
                if (entities[entityKey]) {
                   createSelection(document.getElementById('example_input_'+splitNumber),entities[entityKey].start,entities[entityKey].end)
                }
            } else {
                entityTypeChanged(entityKey,entityType);
            }
        }
    }
    
    function entityTypeChanged(entityNumber,type) {
        //console.log(['ENTY TYPE CHANGE',entityNumber,type])
        var newItem = item
        if (!Array.isArray(item.entities)) {
            item.entities = []
        }
         //console.log(['ENTY TYPE CHANGE ITEM ENT',item.entities])
        var newEntities = item.entities 
        var entity = newEntities[entityNumber] ? newEntities[entityNumber] : {}
        const typeChanged = !(type && type.length > 0 && type === entity.type)
        //console.log(['ENTY TYPE CHANGED',typeChanged,type,entity.type])
        entity.type = type
        if (selectionState && selectionState.textSelection) {
            //console.log(['HAVE SELECTION',selectionState.textSelection])
            const start = selectionState.startTextSelection
            const end = selectionState.endTextSelection
            var isOverlapProblem = false;
            if (typeof parseInt(start) === "number" && typeof parseInt(end) === "number") {
                item.entities.map(function(entity) {
                    // is OK if updating entity 
                    const bypass = !typeChanged && entity.type === type
                    const isOverlap = (entity.start > start && entity.start < end) || (entity.end > start && entity.end < end)
                    //console.log(['CHECK ENTITY',bypass, isOverlap, entity.type,start,end,entity.start,entity.end])
                    if (!bypass && isOverlap) isOverlapProblem = true
                    return null
                })
            }
            if (isOverlapProblem) {
                setPageMessage('Overlap with existing entity !')
                setTimeout(function() {
                    setPageMessage('')
                },2000)
            } else {
                entity.value = selectionState.textSelection
                entity.start = selectionState.startTextSelection
                entity.end = selectionState.endTextSelection
                if (!newEntities[entityNumber]) newEntities.push(entity)
                else newEntities[entityNumber] = entity
                newItem.entities = newEntities
                setSelectionState(null)
                saveItem(newItem,splitNumber)
            }
        } else {
            if (!newEntities[entityNumber]) newEntities.push(entity)
            else newEntities[entityNumber] = entity
            newItem.entities = newEntities
            setSelectionState(null)
            saveItem(newItem,splitNumber)
        }
        
    }
    
    function intentChanged(intent) {
        var newItem = item 
        newItem.intent = intent
        saveItem(newItem,splitNumber)
    }
 
    
    function entityDelete(entityNumber) {
        if (item.entities) {
            var newItem = item 
            var newEntities = item.entities.slice(0,entityNumber).concat(item.entities.slice(entityNumber + 1))
            newItem.entities = newEntities
            saveItem(newItem,splitNumber)
        }
    }
    
    function selectItem(splitNumber) {
        var newItem = item
        item.isSelected = true;
        saveItem(newItem,splitNumber)
    }
    
    
    function setSkill(skill, splitNumber) {
        //var newItem = item
        //item.isSelected = true;
        //props.saveItem(newItem,splitNumber)
    }
    
    function deselectItem(splitNumber) {
        var newItem = item
        item.isSelected = false;
        saveItem(newItem,splitNumber)
    } 
    
    return {    
        intentTitle, setIntentTitle, selectionState, setSelectionState, newEntity, setNewEntity, tags, setTags, skills, setSkills, reactTags, reactSkills, onTagDelete, onTagAddition, onSkillDelete,onSkillAddition, createSelection, updateExampleContent, entityClicked, entityTypeChanged, intentChanged, entityDelete, selectItem, setSkill, deselectItem
    }
    
}
export default useNluRow
