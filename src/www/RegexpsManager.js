/* global window */
import React, { useEffect} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'
import {generateObjectId} from './utils'
import RegexpsManagerSearchBar from './components/RegexpsManagerSearchBar'
import RegexpsManagerRow from './RegexpsManagerRow'
import useListItemEditor from './useListItemEditor'

var initData = [
    {
      "value": "Proper Noun/Name",
      "synonym": "\t\n(?<FirstName>[A-Z]\\.?\\w*\\-?[A-Z]?\\w*)\\s?(?<MiddleName>[A-Z]\\w*|[A-Z]?\\.?)\\s?(?<LastName>[A-Z]\\w*\\-?[A-Z]?\\w*)(?:,\\s|)(?<Suffix>Jr\\.|Sr\\.|IV|III|II|)"
    },
    {
      "value": "Credit Card (Visa/Mastercard/Discover/American Express/Diners Club)",
      "synonym": "^((4\\d{3})|(5[1-5]\\d{2})|(6011))-?\\d{4}-?\\d{4}-?\\d{4}|3[4,7]\\d{13}$\t\n^((?:4\\d{3})|(?:5[1-5]\\d{2})|(?:6011)|(?:3[68]\\d{2})|(?:30[012345]\\d))[ -]?(\\d{4})[ -]?(\\d{4})[ -]?(\\d{4}|3[4,7]\\d{13})$"
    },
    {
      "value": "Positive Integer",
      "synonym": "^(0|(\\+)?[1-9]{1}[0-9]{0,8}|(\\+)?[1-3]{1}[0-9]{1,9}|(\\+)?[4]{1}([0-1]{1}[0-9]{8}|[2]{1}([0-8]{1}[0-9]{7}|[9]{1}([0-3]{1}[0-9]{6}|[4]{1}([0-8]{1}[0-9]{5}|[9]{1}([0-5]{1}[0-9]{4}|[6]{1}([0-6]{1}[0-9]{3}|[7]{1}([0-1]{1}[0-9]{2}|[2]{1}([0-8]{1}[0-9]{1}|[9]{1}[0-5]{1})))))))))$"
    },
    {
      "value": "US Currency",
      "synonym": "^\\$(\\d{1,3}(\\,\\d{3})*|(\\d+))(\\.\\d{2})?$\n^\\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\\.[0-9][0-9])?$"
    },
    {
      "value": "URL",
      "synonym": "^(ht|f)tp(s?)\\:\\/\\/[a-zA-Z0-9\\-\\._]+(\\.[a-zA-Z0-9\\-\\._]+){2,}(\\/?)([a-zA-Z0-9\\-\\.\\?\\,\\'\\/\\\\\\+&amp;%\\$#_]*)?$"
    },
    {
      "value": "Domain Name",
      "synonym": "^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)*[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?$\n^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$"
    },
    {
      "value": "Email Address",
      "synonym": "^([a-zA-Z0-9_\\-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$"
    },
    {
      "value": "US Zipcode",
      "synonym": "(^(?!0{5})(\\d{5})(?!-?0{4})(-?\\d{4})?$)\n(^(?!0{5})(\\d{5})(?!-?0{4})(-?\\d{4})?$)"
    },
    {
      "value": "UK Postcode",
      "synonym": "^[A-Za-z]{1,2}[0-9A-Za-z]{1,2}[ ]?[0-9]{0,1}[A-Za-z]{2}$"
    }
  ]

initData = initData.map(function(item) {
  return Object.assign(item,{id:generateObjectId()})  
})

const RenderRow = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <RegexpsManagerRow  
         item={item}  splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         lookups={props.data.lookups}  lastSelected={props.data.lastSelected} setLastSelected={props.data.setLastSelected} selectBetween={props.data.selectBetween}  />
}

export default  function RegexpsManager(props) {
    const {listFilterValue, setListFilterValue, loadAll, deleteItem , findKeyBy, searchFilter,fromSkill,  setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap,  filteredItems, deleteAll, createEmptyItem, sort, lastSelected, setLastSelected, selectBetween} = useListItemEditor('nlutool','regexps','alldata', props.updateFunctions.updateRegexps, initData, props.updateFunctions.setIsChanged)
    //const [currentList, setCurrentList] = useState('')

    function getItemSize() {
        if (window.innerWidth < 430) {
               return 390
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
               return 325
        } else {
            return 205
        }
    }

    useEffect(() => {
        loadAll()
        //props.updateFunctions.updateLists(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
   
    function renderEditor(props) {
            if (filteredItems && filteredItems.length > 0) {
            
                return <div>
                    <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length} matches </span>
                     
                     {props.lookups.selectedRegexTally > 0 && <span style={{float:'right'}}> 
                        <span>With {props.lookups.selectedRegexTally} selected&nbsp;</span>
                        <ListAllDropDown tagAll={tagAll} tagAllValue={tagAllValue} setTagAllValue={setTagAllValue} untagAll={untagAll} lookups={props.lookups}/>
                        <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                    </span>} 
                    
                      <div style={{clear:'both'}}>
                        <div style={{clear:'both'}}>
                            <List
                                key="list"
                                ref={listRef}
                                itemData={{items: filteredItems, saveItem: saveItemWrap, deleteItem, findKeyBy, lookups: props.lookups, lastSelected, setLastSelected, selectBetween}}
                                itemKey={index => index}  
                                className="List"
                                height={700}
                                itemCount={filteredItems.length}
                                itemSize={getItemSize}
                                width={'100%'}
                              >{RenderRow}
                            </List>
                        </div>
                    </div>
               </div>

            }
              
    }
    
  
    return <div>
        
                   
        {<RegexpsManagerSearchBar {...props} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort} fromSkill={fromSkill} />}
         
         
         {renderEditor(props)}
    </div>
            
}
      

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


