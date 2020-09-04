import NluExampleRow from './NluExampleRow'
const NluExampleRowRenderer = function(props) {
    const index = props.index
    const style = props.style
    const item = props.data.items[index]
    return <NluExampleRow  
         item={item}  setItem={props.data.setItem} splitNumber={index} style={style}
         saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         intentLookups={props.data.intentLookups} 
         entityLookups={props.data.entityLookups}   />
}
export default NluExampleRowRenderer
