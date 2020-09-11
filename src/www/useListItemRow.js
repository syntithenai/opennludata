import React, {useState, useEffect} from 'react'
import {uniquifyArray, uniquifyArrayOfObjects} from './utils'
function useListItemRow(item, saveItem, splitNumber, style) {
    const [selectionState, setSelectionState] = useState({})
    //const [newEntity, setNewEntity] = useState('')
    // for ReactTags format using objects
    const [tags, setTags] = useState([])
    //console.log(['USENLUROW',splitNumber])
    const reactTags = React.createRef()
     // tags
    useEffect(() => {
        if (item.tags) setTags(item.tags.map(function(tag,i) {return {id:i, name:tag}}))
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
         console.log(['ontagad',tag, tags])
         if (tag && tag.name.trim().length > 0) {
            const newTags = [].concat(tags, tag)
            console.log(['ontagad new',newTags])
            var newItem = item
            var tagArray = uniquifyArray(newTags.map(function(newTag) { return newTag.name}))
            newItem.tags = tagArray.sort()
            console.log(['ontagad presave',tagArray,JSON.parse(JSON.stringify(newItem)),splitNumber])
            saveItem(newItem,splitNumber)
            console.log(['ontagad saved'])
            setTags(uniquifyArrayOfObjects(newTags,'name').sort(function(a,b) {if (a.name > b.name) return 1; else return -1} ))
            
        }
      }
    
    function updateExampleContent(content) {
        //console.log(['UPDTEXT', item, content])
        if (item && typeof content === "string") {
            //console.log('UPDTEXTREAL')
            const newItem = item //JSON.parse(JSON.stringify(item));
            
            newItem.value = content;
            saveItem(newItem,splitNumber)
        }
    }
    
     function updateExampleSynonym(content) {
        //console.log('UPDTEXT')
        if (item && typeof content === "string") {
            //console.log('UPDTEXTREAL')
            const newItem = item //JSON.parse(JSON.stringify(item));
            
            newItem.synonym = content;
            saveItem(newItem,splitNumber)
        }
    }
    
    
    function selectItem(splitNumber) {
        var newItem = item
        item.isSelected = true;
        console.log(['SELECT LIST ITEM',newItem,splitNumber])
        saveItem(newItem,splitNumber)
    }
   
    
    function deselectItem(splitNumber) {
        var newItem = item
        item.isSelected = false;
        console.log(['DESELECT LIST ITEM',newItem,splitNumber])
        saveItem(newItem,splitNumber)
    } 
    
    return {    
        selectionState, setSelectionState, tags, setTags, reactTags, onTagDelete, onTagAddition, updateExampleContent, updateExampleSynonym, selectItem, deselectItem
    }
    
}
export default useListItemRow
