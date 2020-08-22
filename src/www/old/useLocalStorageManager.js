import {useState, useEffect, useReducer} from 'react';
import {generateObjectId} from './utils'
import localforage from 'localforage'

function reducer(state, action) {
  console.log(['redhce state',state,action])
  switch (action.type) {
    case "add":
      return [...state, action.item];
    case "remove":
      return [
        ...state.slice(0, action.index),
        ...state.slice(action.index + 1)
      ];
    case "update":
      return [
        ...state.slice(0, action.index),
        action.item,
        ...state.slice(action.index + 1)
      ];
    case "replaceall":
      return action.item
    default:
      throw new Error();
  }
}
   

// state manager with local storage backing
export default function useLocalStorageManager(key, database, databaseTable) {
    //console.log('USE '+key)
    const [items, dispatch] = useReducer(reducer,[]);
     var localforageStorage = localforage.createInstance({
       name: database ? database : "Salocalstoragemanager",
       storeName   : databaseTable ? databaseTable : 'keyvalue_pairs',
     });

    //localforageStorage.iterate(function(value, key, iterationNumber) {
        //// Resulting key/value pair -- this callback
        //// will be executed for every item in the
        //// database.
        //console.log([key, value]);
    //}).then(function() {
        ////console.log('Iteration has completed');
    //}).catch(function(err) {
        //// This code runs if there were any errors
        //console.log(err);
    //});

    
        
    useEffect(() => {
        //console.log('save effect')
        //console.log(items)
        localforageStorage.setItem(getLocalStorageKey(),items)  
    },[items,localforageStorage,getLocalStorageKey])
    
    function getLocalStorageKey() {
        return key ? key : 'items';
    }
    
    function getLocalStorageItemKey(id) {
        if (id) {
            return getLocalStorageKey()+'_'+id
        } else {
            throw ('Missing Id getting storage key')
        }
    }
    
    function loadAll() {
        //console.log('load all')
        try {
            localforageStorage.getItem(getLocalStorageKey()).then(function(items) {
                if (items && typeof items === "object") {
                    dispatch({ type: "replaceall", item: items });
                    //console.log('set items')
                    //console.log(items)
                    ////return items;
                }
            })
        } catch(e) {
            console.log(e)
        }
        return {}
    }
    
    // save or create
    function saveItem(item) {
        if (item) {
            console.log(['SAVEITEM',item])
            // update sources and save text in seperate localstorage
            // ensure id
            var isNewItem = false;
            if (!item.id) {
                isNewItem = true;
                item.id = generateObjectId()
            }
            if (item.data) {
                //console.log(['SAVEITEM',getLocalStorageItemKey(item.id), item.id,item.data])
                localforageStorage.setItem(getLocalStorageItemKey(item.id),item.data)
                delete item.data
            }
            if (isNewItem) {
                dispatch({ type: "add",item: item });
            } else {
                var index = findKeyBy('id',item.id);
                if (index) {
                    dispatch({ type: "update",item: item, index: index });
                } else {
                    dispatch({ type: "add",item: item });
                }
            }
            //localforageStorage.setItem(getLocalStorageKey(),newItems)
            
        }
    }
    
    function getItemData(id) {
        return new Promise(function(resolve,reject) {
            //console.log('getitem data',id,getLocalStorageItemKey(id))
            if (id) {
                localforageStorage.getItem(getLocalStorageItemKey(id)).then(function(value) {
                    //console.log(['GOT data',id,value,getLocalStorageItemKey(id)])
                    resolve(value)  
                }).catch(function(err) {
                    // This code runs if there were any errors
                    console.log(err);
                });
             
            }
        })
    }
    
    function findBy(field,value) {
        var key = findKeyBy(field,value)
        return items[key];
    }
    
    function findKeyBy(field,value) {
        for (var k in items) {
            if (items[k] && items[k][field] === value) return k
        }
    }
    
    function setItemsWrap(items) {
        localforageStorage.setItem(getLocalStorageKey(),items)
        dispatch({ type: "replaceall", item: items });
    }
    
    function deleteItem(key, id) {
        //console.log(['DEL',id,key])
        dispatch({ type: "remove", index: key})
        if (id) {
            localforageStorage.removeItem(getLocalStorageItemKey(id))
        }
    }
    return {getLocalStorageKey:getLocalStorageKey, getLocalStorageItemKey:getLocalStorageItemKey, loadAll:loadAll, saveItem:saveItem, deleteItem:deleteItem , getItemData:getItemData, items:items, setItems:setItemsWrap, findKeyBy:findKeyBy, findBy:findBy}
    
}
