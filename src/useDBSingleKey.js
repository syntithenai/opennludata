// USE A SINGLE LOCALSTORAGE KEY FOR PERSISTENCE
// this is much faster than using set/getItem for each item
// workable for many thousands of rows
import { useEffect, useReducer} from 'react';

import {generateObjectId} from './utils'
import localforage from 'localforage'

// handle list updates with minimum disruption to top level items
function reducer(state, action) {
    const index = parseInt(action.index)
 
    switch (action.type) {
    case "append":
      if (action.item) {
        return [...state, action.item];
      } else return state
    case "prepend":
      if (action.item) {
        return [action.item,...state];
      } else return state
    case "insert":
      if (action.item && typeof index === "number" ) {
          if (state.length > 0) {
              return [
                ...state.slice(0, index),
                action.item,
                ...state.slice(index)
              ];
          } else return state
        } else return state
    case "remove":
      if (typeof index === "number" ) {
          return [
            ...state.slice(0, index),
            ...state.slice(index + 1)
          ];
       } else return state 
    case "update":
       if (action.item && typeof index === "number" ) {
           return  [
            ...state.slice(0, index),
            action.item,
            ...state.slice(index + 1)
          ];
        } else return state 
    case "replaceall":
        if (typeof action.items === "object") {
            return action.items
        } else return state
    default:
      throw new Error('Invalid reduction in useDBSingleKey');
  }
    
}

// state manager with local storage backing
export default function useDB(database, databaseTable,singleKey) {
    if (!singleKey) singleKey = 'data'
     const [items, dispatch] = useReducer(reducer,[]);
     var localforageStorage = localforage.createInstance({
       name: database ? database : "localstoragemanager",
       storeName   : databaseTable ? databaseTable : 'single_key_data',
     });

    useEffect(function() {
        localforageStorage.setItem(singleKey,items)  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[items])

    function getId(item) {
        if (item && item.id) {
            return item.id
        } else {
            throw new Error("Missing ID value in getId")
        }
    }

    function loadAll() {
        localforageStorage.getItem(singleKey).then(function(res) {
          //console.log(['loadall',database, databaseTable,singleKey,res])
          dispatch({ type: "replaceall", items: res ? res : []});
        })
    }

    
    // save or create
    function saveItem(item,index) {
        //console.log(['save',item,index])
        if (item) {
            // update sources and save text in seperate localstorage
            // ensure id
            var isNewItem = false;
            if (!item.id) {
                isNewItem = true;
                item.id = generateObjectId()
            }
            if (items.length === 0) {
                //console.log(['save append len '])
        
                dispatch({ type: "append",item: item });
            } else {
                if ((index === null || index === undefined)  || isNewItem) {
                //console.log(['save append'])
                    dispatch({ type: "prepend",item: item });
                } else {
                    //console.log(['save update'])
                    dispatch({ type: "update",item: item, index: index });
                }
            }   
            
        }
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
        localforageStorage.clear().then(function() {
            dispatch({ type: "replaceall", items: items})
        })
    }
    
    function filter(matchFunction) {
        var filtered = []
        if (matchFunction) {
            items.map(function(item,i) {
              if (item && matchFunction(item)) {
                  filtered.push(item)
              } 
              return null 
            })
        }
        return filtered
        
    }
    
    function deleteItem(index) {
        dispatch({ type: "remove", index: index})
    }
    return {getId:getId, loadAll:loadAll, saveItem:saveItem, deleteItem:deleteItem , items:items, setItems:setItemsWrap, findKeyBy:findKeyBy, findBy:findBy, filter: filter}
    
}
