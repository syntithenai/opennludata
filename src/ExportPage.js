import React, {useState} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {Button, Modal} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import {exportJSON} from './export/exportJSON'

function ExportPage(props) {
    const [copied, setCopied] = useState(false)
    
    var text = exportJSON(props.currentSkill)
    
    return <Modal show={props.showExportDialog}  onHide={function() {props.setShowExportDialog(false)}}>
          <Modal.Header closeButton>
            <Modal.Title>Export</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ol>
    <li>
        <CopyToClipboard text={text}
          onCopy={() =>setCopied(true)}>
            <Button variant={copied?'success':'primary'}>{copied?'Copied':'Copy'}</Button>
        </CopyToClipboard> the exported skill from the text area 
    
    <textarea style={{display:'block', width:'20em', height:'5em'}}  defaultValue={text} ></textarea>
     </li>
     
     <li style={{marginTop:'1em'}}>   
     Open the <a href='https://github.com/syntithenai/opennludata/wiki/_new'  target="_new" ><Button>Wiki</Button></a> and paste your exported skill into a new page.
     
     </li>
     
     <li style={{marginTop:'1em'}}>   
     <Link to="/search" ><Button>Search</Button></Link> for your uploaded skill
     
     </li>
     
     </ol> 
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={function() {props.setShowExportDialog(false)}}>Close</Button>
          </Modal.Footer>
    </Modal>
    
    
}

export default ExportPage
