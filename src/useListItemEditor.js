import React, {useState, useEffect} from 'react';
import localforage from 'localforage'
import useDBSingleKey from './useDBSingleKey'
import {generateObjectId, uniquifyArray} from './utils'


function useListItemEditor(database, databaseTable, databaseKey, updateLists) {
    const {loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter} = useDBSingleKey(database, databaseTable, databaseKey)
    const [filteredItems, setFilteredItems] = useState([])
    const [filteredItemsKeys, setFilteredItemsKeys] = useState([])
    const [searchFilter, setSearchFilter] = useState('')
    const [tagAllValue, setTagAllValue] = useState('')
    const listRef = React.createRef()
    const [listFilterValue, setListFilterValue] = useState('')
      
    useEffect(() => {
         var filteredItems = filter(function(item) {
            //return true;
            var matchText = true
            if (searchFilter && searchFilter.trim().length >0) {
                if (item.value.indexOf(searchFilter) !== -1) {
                    matchText = true
                } else {
                    matchText = false
                }
            }
            var matchPicklist = true
            if (listFilterValue === "Not In A List") {
                console.log(['tags',item.tags])
                if (!item.tags || (item.tags && item.tags.length == 0)) {
                    matchPicklist =  true
                } else {
                    matchPicklist = false
                }
            } else if (listFilterValue && listFilterValue.trim().length >0) {
                if (item.tags && item.tags.indexOf(listFilterValue) !== -1) {
                    matchPicklist = true
                } else {
                    matchPicklist = false
                }
            }
            
            return matchText && matchPicklist
            //return (item.value.indexOf(searchFilter) !== -1 
                        //|| (item.tags && item.tags.indexOf(searchFilter) !== -1)) ? true : false
        })
        var itemKeys = {}
        filteredItems.map(function(item) {if (item.id) itemKeys[item.id] = true; return null})
        filteredItems.sort(function(a,b) { return a.value < b.value ? true : false})
        setFilteredItems(filteredItems)
        setFilteredItemsKeys(itemKeys)
        updateLists(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[items, searchFilter, listFilterValue])
    
    function deleteAll(e)  {
        if (window.confirm('Really delete all selected')) {
                if (items) {
                var newItems = []
                items.map(function(item,i) {
                    if (item.id && filteredItemsKeys[item.id]) {
                       if (!item.isSelected) {
                           newItems.push(item)
                       }
                    } else {
                        newItems.push(item)
                    }
                    return null
                })
                setItems(newItems)
                listRef.current.resetAfterIndex(0);
            }
        }
         
    }
    
    function tagAll(val) {
        console.log(['tagall',tagAllValue,val])
        var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.tags) newItem.tags=[]
                   if (newItem.tags.indexOf(tagValue) === -1) newItem.tags.push(tagValue)
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }

    function untagAll(val) {
        console.log(['untagall',tagAllValue,val])
        //var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.tags) newItem.tags=[]
                   var finalTags = []
                   newItem.tags.map(function(tag) {
                       if (tag != val) {
                           finalTags.push(tag)
                       }  
                       return null
                   })
                   newItem.tags = finalTags
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }
    
    
    function resetSelection() {
         console.log('reset sa')
         if (items) {
            var newItems = []
            items.map(function(item,i) {
               var newItem = item
               newItem.isSelected = false
               newItems.push(newItem)
               return null
            })
            setItems(newItems)
            
        }
    }
    
     function selectAll() {
         if (items) {
            var newItems = []
            items.map(function(item,i) {
                if (item.id && filteredItemsKeys[item.id]) {
                   var newItem = item
                   newItem.isSelected = true
                   newItems.push(newItem)
                } else {
                    newItem.isSelected = false
                    newItems.push(newItem)
                }
                return null
            })
            setItems(newItems)
        }
    }
    
    function saveItemWrap(item,index) {
        saveItem(item,index)
        listRef.current.resetAfterIndex(index);
        updateLists(items)
    }
    
    function getItemSize(index) {
        //console.log(window.innerWidth,window.innerHeight)
        // set parameters for full size > 1024
        var baseSize = 40
        //// tiny screen mobile 
        if (window.innerWidth < 430) {
            baseSize = 120
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
            baseSize = 70
        }
        return baseSize
    }
    
   function createEmptyItem(list) {
       var tags=[]
        if (list && list !== "Not In A List" && list.trim().length > 0) tags.push(list)
        setSearchFilter('')
        saveItem({id:null, value:'', synonym:'',tags:tags})
   }
    
    return {
        loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter, filteredItems, setFilteredItems,
        searchFilter, setSearchFilter, tagAllValue, setTagAllValue,listRef, listFilterValue, setListFilterValue,
        tagAll,untagAll, resetSelection, selectAll, saveItemWrap, getItemSize, deleteAll, createEmptyItem
    }
}
export default useListItemEditor
