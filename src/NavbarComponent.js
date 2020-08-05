import React , {Fragment} from 'react';
import {Button, Navbar } from 'react-bootstrap'
import {Link} from 'react-router-dom'


export default function NavbarComponent(props) {
    console.log(props)
    var astyle={paddingLeft:'0.3em'}
    var title = ''
    const currentPage = props.history && props.history.location && props.history.location.pathname ? props.history.location.pathname : '/'
    const pages = {
        '/': {name: 'NLU Tool',show: false},
        '/sources': {name: 'Sources',show: true},
        '/import': {name: 'Import',show: true},
        '/examples': {name: 'Examples',show: true},
        '/skills': {name: 'Skills',show: true},
        '/search': {name: 'Search',show: true},
        '/help': {name: 'Help',show: false}
    }
    
    const links = Object.keys(pages).map(function(link) {
        const page = pages[link]
        if (page.show) return <Link style={astyle} to={link} ><Button variant={link == currentPage ? 'success' : 'primary'}>{page.name}</Button></Link>
    })
//        <Navbar.Text><Button><img src='/menu.svg' alt='menu' /></Button></Navbar.Text>

    return <Navbar  bg="dark" variant="dark"  >
        <Link to="/menu" >
        </Link>
         
        <div style={{width: '100%'}}>
        {links}
        </div>
        
        {props.message}
        <Navbar.Text style={{position:'fixed', top:'10px', right:'10px'}} className="justify-content-end" ><Link to="/help" ><Button>Help</Button></Link></Navbar.Text>
        <img src='/waiting_small.gif' alt='waiting' style={{position:'fixed', top:5, right:5, zIndex:99, display: props.waiting ? 'block' : 'none' }} />
    </Navbar>
}


        //<Navbar.Text><Link to="/organise" ><Button>Organise</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/skills" ><Button>My Skills</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/search" ><Button>Search Community</Button></Link></Navbar.Text>
