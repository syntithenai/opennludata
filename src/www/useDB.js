import {useReducer} from 'react';
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
        return [action.item, ...state];
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
      throw new Error('Invalid reduction in useDB');
  }
}
   

// state manager with local storage backing
export default function useDB(database, databaseTable) {
     const [items, dispatch] = useReducer(reducer,[]);
     var localforageStorage = localforage.createInstance({
       name: database ? database : "localstoragemanager",
       storeName   : databaseTable ? databaseTable : 'data',
     });

    function getId(item) {
        if (item && item.id) {
            return item.id
        } else {
            throw new Error("Missing ID value in getId")
        }
    }
    function getIdForIndex(index) {
        if (items && items[index] && items[index].id) {
            return items[index].id
        } else {
            throw new Error("Missing ID value in getIdForIndex")
        }
    }
    

    function loadAll() {
        //console.log(['LOAD ALL '])
        localforageStorage.keys().then(function(keys) {
            var ipromises = []
            keys.map(function(key) {
                ipromises.push(new Promise(function(iresolve,ireject) {
                   localforageStorage.getItem(key).then(function(res) {
                       iresolve(res)
                   })
                }))
                return null
            })
            Promise.all(ipromises).then(function(res) {
                //console.log(['LOADED ALL ',res])
                res = res.sort(function(a,b) {if (a.updated_date < b.updated_date) return 1; else return -1})
                dispatch({ type: "replaceall", items: res });
            })
        })
    }

    
    // save or create
    function saveItem(item,index) {
        if (item) {
            //console.log(['SAVEDB',item,index])
            // update sources and save text in seperate localstorage
            // ensure id
            var isNewItem = false;
            if (!item.id) {
                isNewItem = true;
                item.id = generateObjectId()
            }
            localforageStorage.setItem(item.id,item)
            if (isNewItem) {
                dispatch({ type: "prepend",item: item });
            } else {
                if (items) {
                    var found = null
                    items.map(function(listItem,listItemIndex) {
                        if (listItem.id === item.id) {
                            found = listItemIndex
                        } 
                        return null
                    })
                    if (found != null) {
                        dispatch({ type: "update",item: item , index: found});
                    } else {
                        dispatch({ type: "prepend",item: item });
                    }
                } 
            }  
        }
    }
    
    function findBy(field,value) {
        var key = findKeyBy(field,value)
        if (key) return items[key];
        return null
    }
    
    function findKeyBy(field,value) {
        for (var k in items) {
            if (items[k] && items[k][field] === value) return k
        }
        return null
    }


    function setItemsWrap(items) {
        //console.log(['SAVEDB set items',items])
        localforageStorage.clear().then(function() {
            dispatch({ type: "replaceall", items: items})
            if (items) {
                items.map(function(item) { localforageStorage.setItem(getId(item),item); return null})
            }
        })
        
    }
    
    function deleteItem(index) {
        var id = getIdForIndex(index)
        if (id) {
            localforageStorage.removeItem(id).then(function() {
                dispatch({ type: "remove", index: index})
            })
        }
        
    }
    
    function filter(matchFunction) {
        var filtered = []
        if (matchFunction) {
            items.map(function(item,i) {
              if (matchFunction(item)) {
                  filtered.push(item)
              }  
              return null
            })
        }
        return filtered
        
    }
    
    return {getId:getId, loadAll:loadAll, saveItem:saveItem, deleteItem:deleteItem , items:items, setItems:setItemsWrap, findKeyBy:findKeyBy, findBy:findBy, filter: filter}
    
}
