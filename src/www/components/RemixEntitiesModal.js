import React, {useState, useEffect} from 'react';
import {Button, Modal} from 'react-bootstrap'
import mixIntents from '../intentMixer' 
import DropDownSelectorComponent from './DropDownSelectorComponent'

const RemixEntitiesModal = function(props) {
    //console.log(['RemixEntitiesModal',props.lookups])
  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [allowedEntities, setAllowedEntities] =  useState([])
  const [intents, setIntents] =  useState([])
  const [selectedEntity, setSelectedEntity] =  useState('')
  const [selectedList, setSelectedList] =  useState('')
  

  useEffect(() => {
      var entities = {}
      var intentsList = []
      props.filteredItems.filter(function(item) {
          //console.log(['filter',item.selected,item])
            if (item.isSelected) return true
            else return false
          }).map(function(intent) {
              intentsList.push(intent)
           if (intent.entities) {
               intent.entities.map(function(entity) {
                  //console.log(entity)  
                  if (entity.type) entities[entity.type] = true
               })
           } 
      })
      props.updateFunctions.updateLists()
      setIntents(intentsList)
      setAllowedEntities(Object.keys(entities))
  },[props.intents])

  return (
    <>
      <Button size="sm" variant="primary" onClick={handleShow}>
        Mix Entities
      </Button>

      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Mix Entities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        
        <div>With {intents ? intents.length : 0} selected intents </div>
        <div>Replace entities of type
            &nbsp;&nbsp;<DropDownSelectorComponent title='Entity' value={selectedEntity} options={allowedEntities} selectItem={setSelectedEntity} />
         </div>
         <br/>
        <div>With random values from 
            &nbsp;&nbsp;<DropDownSelectorComponent title='List' value={selectedList} options={props.lookups.listsLookups} selectItem={setSelectedList} />
        </div>
        <br/>
        <b>Be warned, Randomly remixing entities could result in nonsensical examples </b>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
            Cancel
          </Button>
          {(selectedEntity && selectedEntity.trim() && selectedList && selectedList.trim()) && <Button variant="danger" onClick={function(e) {mixIntents(intents,selectedEntity,selectedList).then(function() {  window.location = "/examples/tag/mix "+selectedEntity+" "+selectedList})}} >Mix</Button>}
          {!(selectedEntity && selectedEntity.trim() && selectedList && selectedList.trim()) && <Button variant="secondary"  >Mix</Button>}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RemixEntitiesModal
