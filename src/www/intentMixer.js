import useImportMergeFunctions from './useImportMergeFunctions'
import {uniquifyArray} from './utils'
import localforage from 'localforage'

const {updateIntents} = useImportMergeFunctions()


function mix(intents,entityType,entityList) {
      var localforageStorageEntities = localforage.createInstance({
       name: 'nlutool',
       storeName   :'lists',
     });
     
     return new Promise(function(resolve, reject) {
            console.log(['import examples'])
            localforageStorageEntities.getItem('alldata').then(function(allItems) {
                const entitiesInList=allItems.filter(function(item) {
                    if (item && item.tags && item.tags.indexOf(entityList) !== -1) {
                        return true
                    }  
                })
                if (entitiesInList.length > 0) {
                    console.log(['mix',intents,entityList])
                    var newIntents = intents.map(function(intent) {
                        intent.tags = Array.isArray(intent.tags) ? intent.tags : []
                        intent.tags.push('mix '+entityType+' '+entityList)
                        intent.tags = uniquifyArray(intent.tags)  
                        if (intent.entities) {
                            var offset = 0;
                            intent.entities = intent.entities.map(function(entity) {
                                if (entity.type === entityType) {
                                    var randomEntityValueKey = Math.floor(Math.random() * (entitiesInList.length));  
                                    var randomEntityValue = entitiesInList[randomEntityValueKey].value
                                    var calcoffset = entity.value.length - randomEntityValue.length
                                    entity.value = randomEntityValue
                                    intent.example = intent.example.slice(0,entity.start + offset) + randomEntityValue + intent.example.slice(entity.end  + offset -1)
                                    entity.start = entity.start + offset
                                    entity.end = entity.start + randomEntityValue.length + 1
                                    offset = calcoffset
                                }
                                return entity
                            })
                        }
                        return intent
                    })
                    updateIntents(newIntents).then(function() {resolve()})
                    //resolve()
                }
                resolve()
            })
            
            
      
     })
   
    
   
}

export default mix
