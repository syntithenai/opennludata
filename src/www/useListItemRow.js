/* global window */
import React, {useState, useEffect} from 'react'
import {uniquifyArray, uniquifyArrayOfObjects} from './utils'
function useListItemRow(item, saveItem, splitNumber, style, lastSelected, setLastSelected, selectBetween) {
    const [selectionState, setSelectionState] = useState({})
    //const [newEntity, setNewEntity] = useState('')
    // for ReactTags format using objects
    const [tags, setTags] = useState([])
    ////console.log(['USENLUROW',splitNumber])
    const reactTags = React.createRef()
     // tags
    useEffect(() => {
        if (item.tags) setTags(item.tags.map(function(tag,i) {return {id:i, name:tag}}))
    },[item, JSON.stringify(item.tags)])


    function addListItemData(type,data) {
        console.log(['add',type,data])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        list.push(data)
        newItem[type] = list
        saveItem(newItem,splitNumber)
    }
    
    function deleteListItemData(type,index) {
        console.log(['delete',type,index])
        if (window.confirm('Really delete?')) {
            var newItem = item
            var list = Array.isArray(item[type]) ? item[type].filter(function(data,key) {if (key !== index) return true; else return false }) : []
            newItem[type] = list
            saveItem(newItem,splitNumber)
        }
    }
    
    function updateListItemData(type,index,data) {
        console.log(['udpate',type,index,data,item])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        console.log(['udpate',list, list.length, index])
        if (list.length < index) {
            list[index] = data
        }
        console.log(['udpateF',list])
        
        newItem[type] = list
        saveItem(newItem,splitNumber)
    }
    
    function moveListItemDataUp(type,index) {
        console.log(['move down',type,index])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        if (index > 0) {
            const tmp = list[index]
            list[index] = list[index-1]
            list[index-1] = tmp
        }
        newItem[type] = list
        saveItem(newItem,splitNumber)
    }

    function moveListItemDataDown(type,index) {
        console.log(['move up',type,index])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        if (index <= list.length) {
            const tmp = list[index + 1]
            list[index + 1] = list[index]
            list[index] = tmp
        }
        newItem[type] = list
        saveItem(newItem,splitNumber)
    }
    
    
    //List items inside list inside ListItem
    
    function addListItemDataItem(type,index,field,data) {
        console.log(['add item',type,index,field,data])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        if (index < list.length && list[index]) {
            if (list[index].hasOwnProperty(field) && Array.isArray(list[index][field])) {
                var subList = list[index][field]
                subList.push(data)
                list[index][field] = subList
                newItem[type] = list
                saveItem(newItem,splitNumber)
            }
        }
    }
    
    function deleteListItemDataItem(type,index,field,itemIndex) {
        console.log(['delete item',type,index,field,itemIndex])
        if (window.confirm('Really delete?')) {
            var newItem = item
            var list = Array.isArray(item[type]) ? item[type] : []
            if (index < list.length && list[index]) {
                if (list[index].hasOwnProperty(field) && Array.isArray(list[index][field])) {
                    var subList = Array.isArray(list[index][field]) ? list[index][field].filter(function(data,key) {if (key !== itemIndex) return true; else return false }) : []
                    list[index][field] = subList
                    newItem[type] = list
                    saveItem(newItem,splitNumber)
                }
            }
        }
    }
    
    function updateListItemDataItem(type,index,field,itemIndex,data) {
        console.log(['udpate item',type,index,field,itemIndex,data])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        if (index < list.length && list[index]) {
            if (list[index].hasOwnProperty(field) && Array.isArray(list[index][field])) {
                var subList = list[index][field]
                if (itemIndex < subList.length) {
                    subList[itemIndex] = data
                    list[index][field] = subList
                    newItem[type] = list
                    saveItem(newItem,splitNumber)
                }
            }
        }
    }
    
    function moveListItemDataItemUp(type,index,field,itemIndex) {
        console.log(['move down item',type,index,field,itemIndex])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        if (index < list.length && list[index]) {
            var subList = list[index][field]
            if (itemIndex > 0) {
                const tmp = subList[itemIndex]
                if (tmp) {
                    subList[itemIndex] = subList[itemIndex-1]
                    subList[itemIndex-1] = tmp
                    list[index][field] = subList
                    newItem[type] = list
                    saveItem(newItem,splitNumber)
                }
            }
        }
    }

    function moveListItemDataItemDown(type,index,field,itemIndex) {
        console.log(['move down item',type,index,field,itemIndex])
        var newItem = item
        var list = Array.isArray(item[type]) ? item[type] : []
        if (index < list.length && list[index]) {
            var subList = list[index][field]
            console.log([list,subList])
            if (itemIndex <= subList.length) {
                const tmp = subList[itemIndex+1]
                if (tmp) {
                    subList[itemIndex+1] = subList[itemIndex]
                    subList[itemIndex] = tmp
                    list[index][field] = subList
                    newItem[type] = list
                    saveItem(newItem,splitNumber)
                }
            }
        }
    }
    
    
     function onListItemTagDelete (type,index,field,fieldIndex,subField,subFieldIndex) {
        console.log(['ontagdel',type,index,field,fieldIndex,subField,subFieldIndex])
        //var newItem = item
        //var list = Array.isArray(item[type]) ? item[type] : []
        //if (index < list.length && list[index]) {
            //var subList = list[index][field]
            //console.log([list,subList])
            //if (fieldIndex <= subList.length) {
                //if (subList[fieldIndex] && subList[fieldIndex].hasOwnProperty(subField)) {
                    //var subArray = Array.isArray(subList[fieldIndex][subField]) ? subList[fieldIndex][subField] : []
                    //subArray = subArray.filter(function(data,key) {if (key !== subFieldIndex) return true; else return false })
                    //subList[fieldIndex][subField] = subArray
                    //list[index][field] = subList
                    //newItem[type] = list
                    //saveItem(newItem,splitNumber)
                //}
            //}
        //}
    }
     
      
     function onListItemTagAddition (type,index,field,fieldIndex,subField,subFieldValue) {
        console.log(['ontagad',type,index,field,fieldIndex,subField,subFieldValue])
        var newItem = item
        //var list = Array.isArray(item[type]) ? item[type] : []
        //if (index < list.length && list[index]) {
            //var subList = list[index][field]
             //console.log(['ontagad1',list,subList])
            //if (fieldIndex <= subList.length) {
                //if (subList[fieldIndex] && subList[fieldIndex].hasOwnProperty(subField)) {
                    //var subArray = Array.isArray(subList[fieldIndex][subField]) ? subList[fieldIndex][subField] : []
                    //subArray.push(subFieldValue)
                    //subArray = uniquifyArray(subArray)
                     //console.log(['ontagad2',subArray])
                    //subList[fieldIndex][subField] = subArray
                    //list[index][field] = subList
                     //console.log(['ontagad3',list])
                    //newItem[type] = list
                    //saveItem(newItem,splitNumber)
                    //console.log(['ontagad4',newItem,splitNumber])
                //}
            //}
        //}
        
      }
    
     function onTagDelete (i) {
        //console.log(['ontagdel',i, tags])
        const newTags = tags.slice(0)
        newTags.splice(i, 1)
        setTags(newTags)
        var newItem = item
        newItem.tags = newTags.map(function(newTag) { return newTag.name})
        saveItem(newItem,splitNumber)
        return true
      }
     
     function onTagAddition (tag) {
         //console.log(['ontagad',tag, tags])
         if (tag && tag.name.trim().length > 0) {
            const newTags = [].concat(tags, tag)
            //console.log(['ontagad new',newTags])
            var newItem = item
            var tagArray = uniquifyArray(newTags.map(function(newTag) { return newTag.name}))
            newItem.tags = tagArray.sort()
            //console.log(['ontagad presave',tagArray,JSON.parse(JSON.stringify(newItem)),splitNumber])
            saveItem(newItem,splitNumber)
            //console.log(['ontagad saved'])
            //setTags(uniquifyArrayOfObjects(newTags,'name').sort(function(a,b) {if (a.name > b.name) return 1; else return -1} ))
            return true
        }
      }
    
    function updateExampleContent(content) {
        //console.log(['UPDTEXT', item, content])
        if (item && typeof content === "string") {
            ////console.log('UPDTEXTREAL')
            const newItem = item //JSON.parse(JSON.stringify(item));
            
            newItem.value = content;
            saveItem(newItem,splitNumber)
        }
    }
    
     function updateExampleSynonym(content) {
        //console.log('UPDTEXT')
        if (item && typeof content === "string") {
            ////console.log('UPDTEXTREAL')
            const newItem = item //JSON.parse(JSON.stringify(item));
            
            newItem.synonym = content;
            saveItem(newItem,splitNumber)
        }
    }
    
    function selectItem(splitNumber,e) {
        if (e.shiftKey && lastSelected >= 0)  {
            //console.log(['SELECT INTENT WITH SHIFT '+splitNumber, lastSelected])
            selectBetween(splitNumber,lastSelected) 
            setLastSelected(splitNumber)  
        } else {
            //console.log(['SELECT INTENT WITHOUT  SHIFT ',lastSelected])
            var newItem = item
            item.isSelected = true;
            saveItem(newItem,splitNumber)
            setLastSelected(splitNumber)
            //console.log(['LASTSEL ',lastSelected])
        }
    }
   
    
    function deselectItem(splitNumber) {
        var newItem = item
        item.isSelected = false;
        //console.log(['DESELECT LIST ITEM',newItem,splitNumber])
        saveItem(newItem,splitNumber)
    } 
    
    return {    
        selectionState, setSelectionState, tags, setTags, reactTags, onTagDelete, onTagAddition, updateExampleContent, updateExampleSynonym, selectItem, deselectItem, addListItemData, deleteListItemData, updateListItemData, moveListItemDataUp, moveListItemDataDown, addListItemDataItem, deleteListItemDataItem, updateListItemDataItem, moveListItemDataItemUp, moveListItemDataItemDown, onListItemTagDelete, onListItemTagAddition
    }
    
}
export default useListItemRow
