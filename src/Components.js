import {Link} from 'react-router-dom'
import {Button } from 'react-bootstrap'
import React from 'react';



function HelpText(props) { 
    return <div style={{marginLeft:'0.5em'}}>
        <h1>NLU tool</h1>
        <div>This tool is intended to help collect open licensed NLU data. </div>
        <div>Specifically, it captures sentences with related intent and entity maps.</div>
        <div>Examples can be tagged for organisation. eg music player, news reader</div>
        <div>Examples can be collected into your own skills for export into various NLU training data formats.</div>
        <hr/>
        <p>Create <Link to="/sources" ><Button>Sources</Button></Link> from pasted text or uploaded files.</p>
        <p>Use the <Link to="/import" ><Button>Import</Button></Link> page to break text into sentences and create NLU example records.</p>
        <p><Link to="/examples" ><Button>Organise</Button></Link> your examples using tags and cleanup untagged examples.</p>
        <p><Link to="/search" ><Button>Search </Button></Link> the community database of NLU example records.</p>
        <p><Link to="/skills" ><Button>Collect </Button></Link> examples into a skill for export in various training formats.</p>
        </div>
}




export { HelpText}
