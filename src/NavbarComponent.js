import React from 'react';
import {Button, Navbar } from 'react-bootstrap'
import {Link} from 'react-router-dom'


export default function NavbarComponent(props) {
    return <Navbar  bg="dark" variant="dark"  >
        <Navbar.Brand>NLU Tool</Navbar.Brand>
        <Navbar.Text><Link to="/sources" ><Button>Sources</Button></Link></Navbar.Text>
        <Navbar.Text><Link to="/import" ><Button>Import</Button></Link></Navbar.Text>
        {props.message}
        <Navbar.Text  className="justify-content-end" ><Link to="/help" ><Button>Help</Button></Link></Navbar.Text>
        <img src='/waiting_small.gif' style={{position:'fixed', top:5, right:5, zIndex:99, display: props.waiting ? 'block' : 'none' }} />
    </Navbar>
}


        //<Navbar.Text><Link to="/organise" ><Button>Organise</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/skills" ><Button>My Skills</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/search" ><Button>Search Community</Button></Link></Navbar.Text>
