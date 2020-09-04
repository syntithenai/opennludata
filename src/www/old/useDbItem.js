import {useState, useEffect, useReducer} from 'react';
import {generateObjectId} from './utils'
import localforage from 'localforage'

// state manager with local storage backing
export default function useDbItem(database, databaseTable,recordId) {
    //console.log('USE '+key)
    const [item, setItem ] = useState(null);
    
    var localforageStorage = localforage.createInstance({
       name: database ? database : "localstoragemanager",
       storeName   : databaseTable ? databaseTable : 'item_keyvalue_pairs',
     });

    // item from props on mount
    useEffect(() => {
        if (props.item) setItem(props.item)
    },[])
    
    // save changes to item
    useEffect(() => {
        //console.log('save effect')
        //console.log(items)
        localforageStorage.setItem(item.id ? item.id,item)  
    },[item])
    
    
    function deleteItem(id) {
        //console.log(['DEL',id,key])
        if (id) {
            localforageStorage.removeItem(getLocalStorageItemKey(id))
        }
    }
    return {item:item, setItem: setItem, deleteItem:deleteItem }
    
}
