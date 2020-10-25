import React, {useState, useEffect} from 'react';
import useDBSingleKey from './useDBSingleKey'
import {useParams, useHistory} from 'react-router-dom'
import scrabbleWords from './scrabbleWords'

function useListItemEditor(database, databaseTable, databaseKey, updateLists, initialData, setChanged) {
    const {loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter, sort} = useDBSingleKey(database, databaseTable, databaseKey, initialData, setChanged)
    const [filteredItems, setFilteredItems] = useState([])
    const [filteredItemsKeys, setFilteredItemsKeys] = useState([])
    //const [searchFilter, setSearchFilter] = useState('')
    const [tagAllValue, setTagAllValue] = useState('')
    const listRef = React.createRef()
    //const [listFilterValue, setListFilterValue] = useState('')
    const [lastSelected, setLastSelected] = useState(-1)
    
    var params = useParams()
    var history = useHistory()
    
    var listFilterValue = params.listId ? params.listId : '';
    function setListFilterValue(value) {
        var root = history.location.pathname.split("/")
        var parts=['/'+root[1]]
        if (value) parts.push('/list/'+value)
        if (searchFilter) parts.push('/filter/'+searchFilter)
        if (fromSkill) parts.push('/fromskill/'+fromSkill)
        history.push(parts.join(''))
    }
    
    var searchFilter = params.filter ? params.filter : '';
    function setSearchFilter(value) {
        var root = history.location.pathname.split("/")
        var parts=['/'+root[1]]
        if (listFilterValue) parts.push('/list/'+listFilterValue)
        if (value) parts.push('/filter/'+value)
        if (fromSkill) parts.push('/fromskill/'+fromSkill)
        history.push(parts.join(''))
    }
    
    var fromSkill = params.fromskill ? params.fromskill : '';
    function setFromSkill(value) {
        var root = history.location.pathname.split("/")
        var parts=['/'+root[1]]
        if (listFilterValue) parts.push('/list/'+listFilterValue)
        if (searchFilter) parts.push('/filter/'+searchFilter)
        if (value) parts.push('/fromskill/'+value)
        history.push(parts.join(''))
    }
    
    var fromAction = params.fromaction ? params.fromaction : '';
    //function setFromAction(value) {
        //var root = history.location.pathname.split("/")
        //var parts=['/'+root[1]]
        //if (listFilterValue) parts.push('/list/'+listFilterValue)
        //if (searchFilter) parts.push('/filter/'+searchFilter)
        //if (value) parts.push('/fromskill/'+value)
        //history.push(parts.join(''))
    //}
   
   
      
    useEffect(() => {
         var filteredItems = filter(function(item) {
            //return true;
            var matchText = true
            if (searchFilter && searchFilter.trim().length >0) {
                if ((item.value && item.value.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) || (item.synonym && item.synonym.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) ) {
                    matchText = true
                } else {
                    matchText = false
                }
            }
            var matchPicklist = true
            if (listFilterValue === "Not In A List") {
                ////console.log(['tags',item.tags])
                if (!item.tags || (item.tags && item.tags.length === 0)) {
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
        filteredItems.sort(function(a,b) { return (a.value ? a.value.toLowerCase() : '') < (b.value ? b.value.toLowerCase() : '') ? true : false})
        setFilteredItems(filteredItems)
        setFilteredItemsKeys(itemKeys)
        updateLists(filteredItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[items, searchFilter, listFilterValue])
    
    function deleteAll(e)  {
        if (window.confirm('Really delete all selected')) {
            if (items) {
                var newItems = []
                items.map(function(item,i) {
                    // dump items without id
                    if (item && item.id) {
                        // only delete filtered items
                        if (filteredItemsKeys[item.id]) {
                           // only delete selected filtered items
                           if (!item.isSelected) {
                               newItems.push(item)
                           }
                        // not filtered so push
                        } else {
                            newItems.push(item)
                        }
                    }
                    return null
                })
                setItems(newItems)
                listRef.current.resetAfterIndex(0);
            }
        }
    }
    
    function tagAll(val) {
        //console.log(['tagall',tagAllValue,val])
        var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                if (item && item.id) { 
                    if (item.isSelected && filteredItemsKeys[item.id]) {
                       var newItem = JSON.parse(JSON.stringify(item));
                       if (!newItem.tags) newItem.tags=[]
                       if (newItem.tags.indexOf(tagValue) === -1) newItem.tags.push(tagValue)
                       newItems.push(newItem)
                    } else {
                       newItems.push(item)
                    }
                }
               return null
            })
            setItems(newItems)
        }
    }

    function untagAll(val) {
        //console.log(['untagall',tagAllValue,val])
        //var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
               if (item && item.id) {
                   if (item.isSelected && filteredItemsKeys[item.id]) {
                       var newItem = JSON.parse(JSON.stringify(item));
                       if (!newItem.tags) newItem.tags=[]
                       var finalTags = []
                       newItem.tags.map(function(tag) {
                           if (tag !== val) {
                               finalTags.push(tag)
                           }  
                           return null
                       })
                       newItem.tags = finalTags
                       newItems.push(newItem)
                   } else {
                       newItems.push(item)
                   }  
               }
               return null
            })
            setItems(newItems)
        }
    }
    
    
    function resetSelection() {
         ////console.log('reset sa')
         if (items) {
            var newItems = []
            items.map(function(item,i) {
                if (item) {
                    var newItem = item
                   newItem.isSelected = false
                   newItems.push(newItem)
                }
               return null
            })
            setItems(newItems)
            
        }
    }
    
     function selectAll() {
         //console.log(['SELECTALL',items])
         if (items) {
            var newItems = []
            items.map(function(item,i) {
                if (item && item.id) {
                    var newItem = item
                    if (item.id && filteredItemsKeys[item.id]) {
                       newItem.isSelected = true
                       newItems.push(newItem)
                    } else {
                        newItem.isSelected = false
                        newItems.push(newItem)
                    }
                }
                return null
            })
            setItems(newItems)
        }
    }
        
    function selectBetween(a,b) {
         var min = a
         var max = b
         if (max <  min) {
             min = b
             max = a
         }
         if (items) {
            var newItems = []
            items.map(function(item,i) {
                if (item && item.id) {
                    var newItem = item
                    if (item.id && filteredItemsKeys[item.id]) {
                       if (i >= min && i <= max) newItem.isSelected = true
                       newItems.push(newItem)
                    } 
                }
                return null
            })
            setItems(newItems)
        }
    }
    //function sort() {
         ////console.log(['SORT',items])
         //if (items) {
            //var newItems = items.sort(function(a,b) { if (a.value < b.value) return -1; else return 1;})
            //setItems(newItems)
            //listRef.current.resetAfterIndex(0);
            ////console.log(['SORTed',newItems])
        //}
    //}
    
    function saveItemWrap(item,index) {
        //console.log(['SAVE ITEM WRAP LI',listRef, JSON.parse(JSON.stringify(item)),index])
        if (item) {
            if (item.database === "lists") {
                var sWords = scrabbleWords()
                if (sWords.indexOf(item.value.toUpperCase()) !== -1) {
                    if (item.tags && item.tags.indexOf('scrabbleword') === -1) {
                        console.log('scrabbleword on save')
                        item.tags.push('scrabbleword')
                    }
                } else {
                    item.tags = item.tags ? item.tags.filter(function(item) {
                        return item !== 'scrabbleword'
                    }) : []
                }
            }
            saveItem(item,index)
            if (listRef && listRef.current) listRef.current.resetAfterIndex(index);
            updateLists(items)
        }
    }
    
    function getItemSize(index) {
        ////console.log(window.innerWidth,window.innerHeight)
        // set parameters for full size > 1024
        var baseSize = 40
        //// tiny screen mobile 
        if (window.innerWidth < 430) {
            baseSize = 120
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
            baseSize = 70
        }
        var tallyExtras = 0;
        var item = items[index]
        //console.log(item.tags.length)
        if (item && item.tags) tallyExtras += item.tags.length;
        return baseSize + parseInt(((tallyExtras+2)/2)) * 20
    }
    
   function createEmptyItem(list) {
       var tags=[]
        if (list && list !== "Not In A List" && list.trim().length > 0) tags.push(list)
        setSearchFilter('')
        saveItem({id:null, value:'', synonym:'',tags:tags})
   }
    
    return {
        loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter, filteredItems, setFilteredItems, sort, 
        searchFilter, setSearchFilter, fromSkill, setFromSkill, tagAllValue, setTagAllValue,listRef, listFilterValue, setListFilterValue,
        tagAll,untagAll, resetSelection, selectAll, saveItemWrap, getItemSize, deleteAll, createEmptyItem, lastSelected, setLastSelected, selectBetween, fromAction
    }
}
export default useListItemEditor
