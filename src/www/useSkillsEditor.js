import {useState, useEffect} from 'react';
import {useParams, useHistory} from 'react-router-dom'

//import useNluEditor from './useNluEditor'
//import exportFormats from './export/index'
import useDB from './useDB'
import {generateObjectId, uniquifyArray} from './utils'
//import { saveAs } from 'file-saver';
import useRestEndpoint from './useRestEndpoint'
import localforage from 'localforage'


export default function useSkillsEditor(props) {
    //console.log(['USE SKILLS ED',props.user])

    //const {loadAll, skillFilterValue, setSkillFilterValue, filteredItems} = useNluEditor('nlutool','examples','alldata', props.updateFunctions.updateLookups)
    const [skillKeys, setSkillKeys] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [currentIntent, setCurrentIntent] = useState('')
    const [entitiesForSkill, setEntitiesForSkill] = useState({})
    const [listsForEntity, setListsForEntity] = useState({})
    const [currentSkill, setCurrentSkill] = useState(null)
    //const skillsManager = useDB('nlutool','skills')
    const listsManager = useDB('nlutool','lists')
    //const [showExportDialog, setShowExportDialog] = useState(false)
    const [collatedItems, setCollatedItems] = useState({})
    const [collatedTags, setCollatedTags] = useState({})
    const [collatedCounts, setCollatedCounts] = useState({})
    const [newSlotValue, setNewSlotValue] = useState('')
    const [skillMatches, setSkillMatches] = useState([])
    const [skillUpdatedMatches, setSkillUpdatedMatches] = useState([])
    var skillsStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "skills",
     });
     var examplesStorage = localforage.createInstance({
       name: "nlutool",
       storeName   : "examples",
     });
    const token = props.user && props.user.token && props.user.token.access_token ? props.user.token.access_token : ''
    ////console.log(['SETOKE',token])
    const axiosClient = props.getAxiosClient(token)
    const {saveItem, deleteItem, searchItems} = useRestEndpoint(axiosClient,process.env.REACT_APP_restBaseUrl)

    const [invocation, setInvocation] = useState('')
    const [mongoId, setMongoId] = useState('')
    const [duplicates, setDuplicates] = useState([])
    
    const params = useParams()
    const history = useHistory()
    
    var skillFilterValue = params.skillId ? params.skillId : '';
    function setSkillFilterValue(value) {
        ////console.log('SETSKILLVAL')
        ////console.log(history)
        var root = history.location.pathname.split("/")
        var parts=['/'+root[1]]
        skillFilterValue = value;
        if (skillFilterValue.length > 0) {
            parts.push('/skill/'+skillFilterValue)
        }
        ////console.log(['ssv',parts,value])
        history.push(parts.join(''))
    }
    
    // load skill on init
    useEffect(() => {
        loadSkill()
         //props.updateFunctions.updateLists(listsManager.items[0])
            //props.updateFunctions.updateRegexps(listsManager.items[0])
            //props.updateFunctions.updateUtterances(listsManager.items[0])
            //props.updateFunctions.updateLookups(listsManager.items[0])
    },[])
        
    //// load list lookups
    useEffect(() => {
        if (listsManager.items.length > 0) { 
            ////console.log(['UPD ITEMS',listsManager.items,listsManager.items[0]])
            props.updateFunctions.updateLists(listsManager.items[0])
            //props.updateFunctions.updateRegexps(listsManager.items[0])
            //props.updateFunctions.updateUtterances(listsManager.items[0])
            props.updateFunctions.updateLookups(listsManager.items[0])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[listsManager.items])
 
    // load mongo id into skill when changed
    useEffect(() => {
        if (currentSkill) {
          ////console.log(['SET mongoid HAVE CURRENT SKILL',currentSkill,mongoId])
          var skill = currentSkill
          skill._id = mongoId
          setCurrentSkill(skill)
       }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[mongoId])
    
    // load invocation into skill when changed
    useEffect(() => {
        if (currentSkill) {
          ////console.log(['SET INVOC HAVE CURRENT SKILL',currentSkill,invocation])
          var skill = currentSkill
          skill.invocation = invocation
          setCurrentSkill(skill)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[invocation])    
    
    // look for published version of skill 
    useEffect(() => {
        ////console.log(['USER UPDATE',currentSkill,props.user,props.user._id])
        if (currentSkill && props.user && props.user._id) {
          ////console.log(['USER UPDATE FIND ONLINE'])
          findOnlineSkill(props.user,currentSkill)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.user,listsForEntity]) 
    
    // save skill
    useEffect(() => {
        //
        var skill = currentSkill
        if (skill && skill.title && skill.title.length > 0) {
            // merge in latest entity values derived from intents
            if (entitiesForSkill) {
                Object.keys(entitiesForSkill).map(function(entity) {
                   if (skill.entities && skill.entities[entity]) {
                       skill.entities[entity].values = entitiesForSkill[entity].values;
                   }  
                   return null
                })
            }
            // merge in intents
            skill.intents = collatedItems
            //console.log('SAVE NOW - change cs or inv',JSON.parse(JSON.stringify(skill)))
            skillsStorage.setItem(skillFilterValue, currentSkill, function (err) {
                if (err)  {
                    //console.log(err)
                    throw new Error(err)
                }
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[mongoId,currentSkill,listsForEntity, invocation])
    
  
  
  //function setInvocation(val) {
      ////console.log('SET INVOCK')
      ////if (currentSkill) {
          //////console.log(['SET INVOCK HAVE CURRENT SKILL',currentSkill,val])
          ////var skill = currentSkill
          ////skill.invocation = val 
          ////setCurrentSkill(skill)
      ////}
  //}

    function loadSkill() {
        console.log(['load skill'])
        examplesStorage.getItem('alldata').then(function(allItems) {
            console.log(['load skill items',allItems])
            if (allItems && Array.isArray(allItems)) {
                var filteredItems = []
                var skillKeys = {}
                allItems.map(function(item)   {
                    // collate unique skill keys
                    if (item.skills) {
                        item.skills.map(function(skill) {
                            skillKeys[skill] = true
                            return null
                        })
                    }
                    // filter 
                    console.log(['load skill filter',skillFilterValue,item.skills])
                    if (skillFilterValue && item.skills && item.skills.indexOf(skillFilterValue) !== -1) {
                        filteredItems.push(item)
                    }
                    return null
                })
                setSkillKeys(Object.keys(skillKeys))
                setFilteredItems(filteredItems)
                console.log(['load skill set skill keys and filtered',skillKeys, filteredItems])
                ////console.log('loaded skill items for init',filteredItems, Object.keys(skillKeys),allItems)
                if (skillFilterValue) {
                    //console.log(['LOAD SKILL',skillFilterValue])
                    skillsStorage.getItem(skillFilterValue, function (err, skill) {
                        console.log(['loaded ',skill, err])
                        if (err) throw new Error(err)
                        var newSkill = skill  ? skill : {}
                        newSkill.id = newSkill.id ? newSkill.id : generateObjectId()
                        newSkill.title = skillFilterValue
                        newSkill.invocation = newSkill.invocation ? newSkill.invocation : ''
                        newSkill.entities = indexEntities(newSkill,filteredItems)
                        if (newSkill.title) findOnlineSkill(props.user,newSkill) 
                        var [intents, tags] = indexIntentsAndTags(skill,filteredItems)
                        console.log(['indexed intents ',intents,tags])
                        newSkill.intents = intents
                       // newSkill.tags = tags    
                        setCurrentSkill(newSkill)
                        setInvocation(newSkill.invocation)
                        setMongoId(newSkill._id)
                        listsManager.loadAll()
                        props.updateFunctions.updateUtterances()
                        props.updateFunctions.updateRegexps()
                        props.updateFunctions.updateLookups()
                        console.log(['LOADED LOCAL SKILL ',JSON.parse(JSON.stringify(newSkill))])
                        forceReload(newSkill)
                    })
                }
            }
        })
    }
    
    function findOnlineSkill(user,skill) {
        //console.log(['FINDONLINESKILL',user,skill,props.lookups, props.lookups.skills])
        // if user is logged in, try load the matching online skill
        if (user && user._id && skill.title) {
            //var query = {user:user._id, title:skill.title}
            if (props.lookups.skills) {
                setSkillMatches( Object.values(props.lookups.skills).filter(function(loadedSkill) {
                    //console.log(['FINDONLINESKILL compare',user._id, loadedSkill.user, skill.title, loadedSkill.title])
                    if (loadedSkill && loadedSkill.title ===  skill.title) {
                        if (user._id === loadedSkill.user) {
                            //console.log(['FINDONLINESKILL match', loadedSkill,   loadedSkill.updated_date  ,skill.updated_date , loadedSkill.updated_date - skill.updated_date ])
                            //setSkillMatches([loadedSkill])
                            if (!skill.updated_date || skill.updated_date < loadedSkill.updated_date) {
                                 //console.log(['FINDONLINESKILL match newer', loadedSkill])
                                setSkillUpdatedMatches([loadedSkill])
                            }
                        }
                    }
                }))
            }
        }    
            //if (skill._id) query._id = skill._id
            ////console.log(['SEARCH ONLINE ',query])
            //searchItems('Skill',query).then(function (res) {
                ////console.log(['SKILL RESULTS'])
                ////console.log(res.data)
                //if (res.data && res.data.length > 0) {
                    //var found = false
                    //res.data.map(function(skillItem) {
                        ////console.log(['SKILL RESULTS', skill ? skill._id : '',skillItem ? skillItem._id:''])
                        //if (skill._id && skill._id === skillItem._id) {
                            //found = true
                            ////console.log(['SKILL RESULTS DATES',skill.updated_date ,skillItem.updated_date, skill.updated_date - skillItem.updated_date])
                            //if (skill.updated_date < skillItem.updated_date) {
                                //setSkillUpdatedMatches([res.data[0]])
                            //}
                            //// matching skill OK
                            ////setSkillMatches([res.data[0]])
                        //} 
                        //return null
                    //})
                    //if (!found) {
                        //// potential match
                        //setSkillMatches(res.data)
                    //}
                //} else {
                    //// no match existing so create new OK
                   //setSkillMatches([])
                //}
            //}).catch(function(err) {
                ////console.log(err)  
            //})
            
        //} else {
            //// no match existing so create new OK
           //setSkillMatches([])
        //}
    }
    
    function indexEntities(currentSkill, filteredItems) {
         ////console.log(['INDEX ENETITIES',currentSkill,filteredItems])
         var entities = {}
            // collate entities from filteredItems
            if (Array.isArray(filteredItems)) {
                filteredItems.map(function (item,itemKey) {
                  if (Array.isArray(item.entities)) {
                      item.entities.map(function(entity,entityKey) {
                         if (entity && entity.type && entity.type.length > 0) {
                             if (typeof entities[entity.type] !== "object") entities[entity.type] = {} //
                             //currentSkill.entities && currentSkill.entities[entity.type] ?  currentSkill.entities[entity.type] : {}
                             if (!Array.isArray(entities[entity.type].values )) entities[entity.type].values = []
                             if (currentSkill && currentSkill.entities && currentSkill.entities[entity.type]&& currentSkill.entities[entity.type].alexaType) entities[entity.type].alexaType = currentSkill.entities[entity.type].alexaType
                             if (currentSkill && currentSkill.entities && currentSkill.entities[entity.type]&& currentSkill.entities[entity.type].googleType) entities[entity.type].googleType = currentSkill.entities[entity.type].googleType
                             if (currentSkill && currentSkill.entities && currentSkill.entities[entity.type]&& currentSkill.entities[entity.type].lists) entities[entity.type].lists = currentSkill.entities[entity.type].lists
                             entities[entity.type].values.push(entity.value)
                         }
                         return null
                      })
                  }
                  return null
                })
            }
            // sort and uniquify values
            //var slots = currentSkill && currentSkill.slots ? currentSkill.slots : {}
            Object.keys(entities).map(function(entityName,entityKey) {
               const entity = entities[entityName]
               entity.values = uniquifyArray(entity.values).sort()
               
               //if (slots[entityName]) {
               //} else {
                   //slots[entityName] = {values:[]}
               //}
               return null
            })
            ////console.log(["ENT",entities])
            setEntitiesForSkill(entities)
            return entities;
    }
    
    function indexIntentsAndTags(currentSkill, filteredItems) {
        //console.log(['INDEX INTENTS',currentSkill,filteredItems])
        //if (currentSkill) {
            // collate intents and tags from items
             var newCollatedItems = collatedItems
             var newCollatedCounts = collatedCounts
             var duplicates = {}
             var duplicateRecords = []
             var newCollatedTags = {}
             if (filteredItems) {
                 filteredItems.map(function(item) {
                    if (item.example) {
                       duplicates[item.example] = Array.isArray(duplicates[item.example]) ? duplicates[item.example] : []
                       duplicates[item.example].push(item)
                    }
                    if (item.intent) {
                        if (!newCollatedItems[item.intent]) newCollatedItems[item.intent]=[]
                        newCollatedCounts[item.intent] =   (newCollatedCounts[item.intent] > 0) ? newCollatedCounts[item.intent] + 1 : 1;
                        //if (collatedItems[item.intent].length < 300) {
                            newCollatedItems[item.intent].push({example: item.example, entities: item.entities})
                        //}
                    }
                    if (Array.isArray(item.tags)) {
                        item.tags.map(function(tag) {
                            newCollatedTags[tag] = true
                            return null
                        })
                    } 
                   return null;  
                 })
                 //console.log(['DUPS',duplicates,duplicateRecords])
                 Object.values(duplicates).map(function(items) {
                     //console.log(['DUPS items',items.length,items])
                     if (items.length > 1) {
                         //console.log(['DUPS items',items.length,items])
                         duplicateRecords = [].concat(duplicateRecords,items)
                     }
                     return null 
                 })
                 //console.log(['DUPS',duplicates,duplicateRecords])
                 setDuplicates(duplicateRecords)
                 setCollatedItems(newCollatedItems)
                 setCollatedCounts(newCollatedCounts)
                 setCollatedTags(newCollatedTags)
                return [newCollatedItems, Object.keys(newCollatedTags)]
             } 
        //}
        return [[],[]]
    }
       

    
    


    function setSkill(skill) {
        //console.log(['SETSKILL',currentSkill,skill])
        if (skill && skill.id) {
            setCurrentSkill(skill)
            //setInvocation(skill.invocation)
            setMongoId(skill._id)
           // forceReload()
        } else {
            //console.log(['NOSETSKILL',currentSkill,skill])
        }
    }

    function addListToSkillEntity(entity,list) {
      ////console.log(['ADSKOI',currentSkill,currentSkill.entities,entity,list])
      if (entity && list && list.name) {
            var skill = currentSkill;
            if (!skill.entities) skill.entities={}
            if (!skill.entities[entity]) skill.entities[entity] = {lists:[]}
            if (!Array.isArray(skill.entities[entity].lists)) skill.entities[entity].lists = []
            //var newListsForEntity = listsForEntity
            ////console.log(['ADSKOI1.5',skill])
            skill.entities[entity].lists.push(list.name)
            skill.entities[entity].lists = uniquifyArray(skill.entities[entity].lists).sort()
           //newListsForEntity[entity] = uniquifyArray(newListsForEntity).sort()
            setCurrentSkill(skill)  
            // force render
            forceReload()  
            //} else {
                ////console.log(['ADSKOI new'])
               //newListsForEntity[entity] = [list.name]
            //}
             ////console.log(['ADSKOI2 final',newListsForEntity])
            //setListsForEntity(newListsForEntity)
       } else {
           //console.log([' missing data'])
       }
    }
  
    function removeListFromSkillEntity(entity, listIndex) {
      var skill = currentSkill
      ////console.log(['REMOVESKILLFROMLIST',entity,listIndex])
      if (skill && skill.entities && entity && skill.entities[entity] && skill.entities[entity].lists) {
          var lists = skill.entities[entity].lists
          //lists = uniquifyArray([lists.slice(0, listIndex),lists.slice(listIndex + 1)]).sort()
          lists = lists.slice(0, listIndex).concat(lists.slice(listIndex + 1))
          
          skill.entities[entity].lists = lists
          setCurrentSkill(skill)  
          forceReload()  
          ////console.log(['REMOVESKILLFROMLIST ddd',lists])
      } 
       //var newEntitiesForSkill = entitiesForSkill
       //if (newEntitiesForSkill[entity]) {
           //var lists = newEntitiesForSkill[entity].lists && Array.isArray(newEntitiesForSkill[entity].lists) ? newEntitiesForSkill[entity].lists : [];
           //newEntitiesForSkill[entity].lists = uniquifyArray([lists.slice(0, listIndex),lists.slice(listIndex + 1)]).sort()
           //setEntitiesForSkill(newEntitiesForSkill)
       //}
    }
  
    function setGoogleAssistantEntityType(entity, type) {
        if (currentSkill && entity) {
            var skill = currentSkill;
            if (!skill.entities) skill.entities={}
            if (!skill.entities[entity]) skill.entities[entity] = {}
            skill.entities[entity].googleType = type
            setCurrentSkill(skill)  
           forceReload()  
       } 
    }
    
    function setAlexaEntityType(entity, type) {
        if (currentSkill && entity) {
            var skill = currentSkill;
            if (!skill.entities) skill.entities={}
            if (!skill.entities[entity]) skill.entities[entity] = {}
            skill.entities[entity].alexaType = type
            setCurrentSkill(skill)  
            //console.log('ALEXA')
            //console.log(skill)
            forceReload()  
       } 
    }
    
    function setRASASlotType(entity, type, slots) {
        if (currentSkill && entity && type) {
            var skill = currentSkill;
            var newSlots = slots ? slots : {}
            newSlots[entity].slotType = type
            var rasa = skill.rasa ? skill.rasa : {}
            rasa.slots = newSlots
            skill.rasa = rasa
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            forceReload()  
       } 
    }
       
    function setRASASlotAutofill(entity, type, slots) {
        
            
        if (currentSkill && entity && type) {
            var skill = currentSkill;
            var newSlots = slots ? slots : {}
            newSlots[entity].slotAutofill = type
            var rasa = skill.rasa ? skill.rasa : {}
            rasa.slots = newSlots
            skill.rasa = rasa
            setCurrentSkill(skill)  
            forceReload()  
       } 
    }
    
    function newSlot(name,slots) {
        if (name && name.trim().length > 0) {
            var skill = currentSkill;
            var newSlots = slots ? slots : {}
            var rasa = skill.rasa ? skill.rasa : {}
            newSlots[name] = {}
            rasa.slots = slots
            skill.rasa = rasa
            setCurrentSkill(skill)  
            setNewSlotValue('')
            forceReload()  
        }
    }
    
    function deleteSlot(slot, slots) {
        if (currentSkill && slot && slots ) {
            var skill = currentSkill;
            delete slots[slot]
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.slots = slots
            setCurrentSkill(skill)  
            forceReload()  
        }
    }

    function setRASAActions(data) {
          if (currentSkill && data) {
            var skill = currentSkill;
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.actions = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    
    function setRASAConfig(data) {
        //console.log(['setrasaconfig',data, currentSkill])
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.config = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    
    function setRASAStories(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.stories = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    function setRASAEndpoint(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.endpoint = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }
    function setRASACredentials(data) {
          if (currentSkill) {
            var skill = currentSkill;
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.credentials = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }  
    
    function setRASASession(data) {
       if (currentSkill) {
            var skill = currentSkill;
            skill.rasa = skill.rasa ? skill.rasa : {}
            skill.rasa.session = data
            setCurrentSkill(skill)  
            forceReload()  
       }
    }  
        
    function addRegexp(regexp) {
        //console.log(['ADDREGEX',regexp])
        if (currentSkill && regexp) {
            var skill = currentSkill;
            if (!Array.isArray(skill.regexps)) skill.regexps=[]
            skill.regexps.push({name: regexp.name, synonym: regexp.synonym })
            //skill.regexps = uniquifyArray(skill.regexps)
            setCurrentSkill(skill)  
            //// if this is a new regexp, add it to the main database
            //if (!props.lookups.regexpListsLookups[regexp.name] && !props.lookups.regexpsLookups[regexps.name]) {
                //var regexpStorage = localforage.createInstance({
                   //name: "nlutool",
                   //storeName   : "regexps",
                 //});
                 //regexpStorage.getItem('alldata', function (err,regexps) {
                     //if (err) throw new Error(err)
                     //if (Array.isArray(regexps)) {
                         //regexps.unshift({id:generateObjectId(), value:regexp.name, synonyms:'', tags:[]})
                         //regexpStorage.setItem('alldata',utterances)
                     //}
                 //})
            //}
            forceReload()
       } 
    }
    
    function removeRegexp(index) {
        //console.log(['RE UTTERANCE',index])
        if (typeof index === "number" && currentSkill && currentSkill.regexps && currentSkill.regexps.length > index) {
            var skill = currentSkill;
            skill.regexps = [...skill.regexps.slice(0,index),...skill.regexps.slice(index+1)]
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            forceReload()
        }
    }
    
    function setRegexpIntent(index, intent) {
        //console.log(['set reg intent',index, intent])
        if (typeof index === "number" && currentSkill && currentSkill.regexps && currentSkill.regexps.length > index) {
            var skill = currentSkill;
            skill.regexps = skill.regexps ? skill.regexps : []
            var key = (!isNaN(parseInt(index)) ? parseInt(index) : 0)
            var regexp = skill.regexps[key] ? skill.regexps[key] : {}
            regexp.intent = intent
            skill.regexps[key] = regexp
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            forceReload()
        }
    }
    
    function setRegexpEntity(index,entity) {
        //console.log(['set reg entity',index, entity])
        if (typeof index === "number" && currentSkill && currentSkill.regexps && currentSkill.regexps.length > index) {
            var skill = currentSkill;
            skill.regexps = skill.regexps ? skill.regexps : []
            var key = (parseInt(index) != NaN ? parseInt(index) : 0)
            var regexp = skill.regexps[key] ? skill.regexps[key] : {}
            regexp.entity = entity
            skill.regexps[key] = regexp
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            forceReload()
        }
    }
    
    function addUtterance(utterance) {
        if (currentSkill && utterance && utterance.name) {
            var skill = currentSkill;
            if (!Array.isArray(skill.utterances)) skill.utterances=[]
            skill.utterances.push(utterance.name)
            skill.utterances = uniquifyArray(skill.utterances)
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            // if this is a new utterance, add it to the main database
            if (!props.lookups.utteranceListsLookups[utterance.name] && !props.lookups.utterancesLookups[utterance.name]) {
                var utteranceStorage = localforage.createInstance({
                   name: "nlutool",
                   storeName   : "utterances",
                 });
                 utteranceStorage.getItem('alldata', function (err,utterances) {
                     if (err) throw new Error(err)
                     if (Array.isArray(utterances)) {
                         utterances.unshift({id:generateObjectId(), value:utterance && utterance.name ? utterance.name.trim().replaceAll(' ','_') : '', synonym:utterance.name, tags:[]})
                         utteranceStorage.setItem('alldata',utterances)
                     }
                 })
            }
            forceReload()
       } 
    }
    
    function removeUtterance(index) {
        //console.log(['RE UTTERANCE',index])
        if (typeof index === "number" && currentSkill && currentSkill.utterances && currentSkill.utterances.length > index) {
            var skill = currentSkill;
            skill.utterances = [...skill.utterances.slice(0,index),...skill.utterances.slice(index+1)]
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            forceReload()
        }
    }
    function addUtteranceList(utterance) {
          //console.log(['ADD UTTERANCE LIST',utterance, currentSkill])
          if (currentSkill && utterance) {
            var skill = currentSkill;
            if (!Array.isArray(skill.utterancesLists)) skill.utterancesLists=[]
            skill.utterancesLists.push(utterance.name)
            skill.utterancesLists = uniquifyArray(skill.utterancesLists)
            setCurrentSkill(skill)  
            //console.log('add ut list')
            //console.log(skill.utterancesLists)
            forceReload()
       } 
    }
     
    function removeUtteranceList(index) {
        if (typeof index === "number" && currentSkill && currentSkill.utterancesLists) {
            var skill = currentSkill;
            skill.utterancesLists = [...skill.utterancesLists.slice(0,index),...skill.utterancesLists.slice(index+1)]
            setCurrentSkill(skill)  
            //console.log('RASA')
            //console.log(skill)
            forceReload()
        }
    }  
    
    function addSkillTag(tag) {
          //console.log(['ADD skill tag',tag, currentSkill])
          if (currentSkill && tag) {
            var skill = currentSkill;
            if (!Array.isArray(skill.tags)) skill.tags=[]
            skill.tags.push(tag.name)
            skill.utterancesLists = uniquifyArray(skill.utterancesLists).sort()
            setCurrentSkill(skill)  
            forceReload()
       } 
    }
     
    function removeSkillTag(index) {
          //console.log(['rm skill tag',index, currentSkill])
        if (typeof index === "number" && currentSkill && currentSkill.tags) {
            var skill = currentSkill;
            skill.tags = [...skill.tags.slice(0,index),...skill.tags.slice(index+1)]
            setCurrentSkill(skill)  
            forceReload()
        }
    }  
    

   
    function forceReload(skill) {
        var thisSkill = skill && skill.id ? skill : (currentSkill && currentSkill.id ? currentSkill : {})
        setListsForEntity(JSON.stringify([thisSkill._id,thisSkill.entitiesListsData,thisSkill.utterancesListsData,thisSkill.rasa,
        thisSkill.jovo,thisSkill.mycroft,thisSkill.entities,thisSkill.utterances,thisSkill.utterancesLists, thisSkill.regexps, thisSkill.tags]))  
    }
        
    //addRegexpUtteranceTags,
    return {setAlexaEntityType,setGoogleAssistantEntityType,  removeListFromSkillEntity, addListToSkillEntity,
    currentSkill,setCurrentSkill,  skillFilterValue, invocation, setInvocation, entitiesForSkill, collatedItems, collatedCounts, setCurrentIntent, setSkillFilterValue,
     addRegexp, removeRegexp, setRegexpIntent, setRegexpEntity, setMongoId, saveItem, deleteItem, searchItems,
     removeUtterance, addUtterance,  addUtteranceList, removeUtteranceList, skillKeys, addSkillTag, removeSkillTag,
     newSlot, newSlotValue,    setNewSlotValue,  slots: props.slots, setRASASlotAutofill, setRASASlotType, deleteSlot ,
     setRASAActions, setRASASession , setRASAEndpoint , setRASACredentials  ,setRASAStories ,setRASAConfig, duplicates,
     filteredItems, currentIntent, listsForEntity, listsManager, collatedTags, skillMatches, skillUpdatedMatches,setSkillMatches, setSkillUpdatedMatches, setSkill, forceReload
     }
    
}
