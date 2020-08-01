import {Link} from 'react-router-dom'
import {Button } from 'react-bootstrap'
import React from 'react';
import {Component} from 'react';



function HelpText(props) { 
    return <div>
        <h1>NLU tool</h1>
        <div>This tool is intended to help collect open licensed NLU data. All data managed through this tool is published to the web. <b>Please do not add closed license source material.</b></div>
        <div>Specifically, it captures sentences with related intent and entity maps.</div>
        <div>Examples can be tagged for organisation. eg music player, news reader</div>
        <div>Examples can be collected into your own skills for export into various NLU training data formats.</div>
        <hr/>
        <p>Create <Link to="/grabs" ><Button>Sources</Button></Link> from pasted text or uploaded files.</p>
        <p>Use the <Link to="/import" ><Button>Import</Button></Link> page to break text into sentences and create NLU example records.</p>
        <p><Link to="/organise" ><Button>Organise</Button></Link> your examples using tags and cleanup untagged examples.</p>
        <p><Link to="/search" ><Button>Search </Button></Link> the community database of NLU example records.</p>
        <p><Link to="/skills" ><Button>Collect </Button></Link> examples into a skill for export in various training formats.</p>
        </div>
}

function NluExampleRowComponent(props) {
        return <div>row--{JSON.stringify(props)}</div>
        //let that = this
        //const splits = this.state.importSplits;
        //var splitNumber = data.index
        //var style = data.style
        //var split = that.state.importSplits[splitNumber]
       //console.log(['RR',splitNumber,split])
        
       //var intentOptions = that.state.intentKeys.sort().map(function(intentKey,i) {
          //return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {that.intentChanged(splitNumber,intentKey)}}  >{intentKey}</Dropdown.Item>
       //})
       //// ONE PER ENTITY FOR THIS EXAMPLE
       //var entitiesDropdowns = that.state.entities[splitNumber] ? that.state.entities[splitNumber].map(function(entity,i) {
           //var entityOptions = that.state.entityKeys.sort().map(function(entityKey,j) {
              //return <Dropdown.Item key={j} value={entityKey} onClick={function(e) {that.entityTypeChanged(splitNumber,i,entityKey)}}  >{entityKey}</Dropdown.Item>
           //})
           //return <Dropdown variant='info'  key={i}  as={ButtonGroup}>

          //<Dropdown.Toggle variant='info'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          //<Button variant='info'   size="sm"  onClick={function(e) {that.entityClicked(splitNumber,i,that.state.entities[splitNumber] ? that.state.entities[splitNumber][i].type : '')}} >
            //{that.state.entities[splitNumber] ? <b>{that.state.entities[splitNumber][i].type}</b> : ''} 
            //-
            //{that.state.entities[splitNumber] ? that.state.entities[splitNumber][i].value : 'Select Entity Type'}
          //</Button>
          //<Button variant="info" size="sm" onClick={function(e) {that.entityDelete(splitNumber,i,'')}} >X</Button>
          //<Dropdown.Menu>
              //<form  style={{display:'inline'}}>
                //<div className="form-group">
                  //<input type="text" className="form-control" onChange={function(e) {that.entityTypeChanged(splitNumber,i,e.target.value)}}
                //value={that.state.entities[splitNumber] ? that.state.entities[splitNumber].type : ''} />
                //</div>
              //</form>
              //{entityOptions}
          //</Dropdown.Menu>
        //</Dropdown>
       //}) : [];
        ////PLUS CREATE NEW WHEN TEXT IS SELECTED
       //if (that.state.textSelection.length > 0 && that.state.textSelectionFrom == splitNumber) {
           //var entityOptions = that.state.entityKeys.sort().map(function(entityKey,j) {
              //return <Dropdown.Item key={j} value={entityKey} onClick={function(e) {that.entityTypeChanged(splitNumber,-1,entityKey)}}  >{entityKey}</Dropdown.Item>
           //})
           //entitiesDropdowns.push(<Dropdown key="new" variant='success'  as={ButtonGroup}>

          //<Dropdown.Toggle variant='success'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          //<Button  variant='success' size="sm" >New Entity</Button>

          //<Dropdown.Menu>
           //<form style={{display:'inline'}}>
                //<div className="form-group">
                  //<input type="text" className="form-control" onChange={function(e) {that.entityTypeChanged(splitNumber,-1,e.target.value)}}
                //value={that.state.entities[splitNumber] ? that.state.entities[splitNumber].type : ''} />
                //</div>
              //</form>
              //{entityOptions}
          //</Dropdown.Menu>
        //</Dropdown>)
       //}
       
       //return <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
              //<div style={{position:'relative', width: '100%', textAlign:'left'}}>
                 //{that.state.intents[splitNumber] && <Button  style={{float:'right'}}  variant="success" onClick={function(e) {that.saveNlu(splitNumber)}} >Save</Button>}
                  //<Button  variant="danger" style={{float:'right'}} onClick={function(e) {that.deleteSplit(splitNumber)}} >Delete</Button>
                  //{!that.state.intents[splitNumber] && <Button   style={{float:'right'}} variant="secondary" >Save</Button>} 
                  //<input  type='text' style={{width:'80%'}} value={splits[splitNumber]} onSelect={ function(e) {
                     //var textSelection = window.getSelection().toString(); 
                     //that.setState({textSelection:textSelection, textSelectionFrom: splitNumber, startTextSelection: e.target.selectionStart, endTextSelection: e.target.selectionEnd})
                  //}} id={"example_input_"+splitNumber} onChange={function(e) { that.updateSplitContent(e,splits[splitNumber],splitNumber)}} />
                  //<Dropdown style={{float:'left'}}  as={ButtonGroup}>
                  //<Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
                  //<Button   size="sm" >{that.state.intents[splitNumber] ? that.state.intents[splitNumber].toString() : 'Select Intent'} </Button>
                  //<Dropdown.Menu>
                   //<form className="px-1 py-1" style={{display:'inline'}}>
                        //<div className="form-group">
                          //<input type="text" className="form-control" onChange={function(e) {that.intentChanged(splitNumber,e.target.value)}}
                        //value={that.state.intents[splitNumber] ? that.state.intents[splitNumber] : ''} />
                        //</div>
                      //</form>
                      //{intentOptions}
                  //</Dropdown.Menu>
                //</Dropdown>
                
                //<div>{entitiesDropdowns}</div>
            //</div>
      //</div>
    
}


export { HelpText}
