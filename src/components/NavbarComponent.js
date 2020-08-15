/* global window */
import React  from 'react';
import {Button, Navbar } from 'react-bootstrap'
import {Link} from 'react-router-dom'
import fireImage from '../images/singingman.svg'
import waitingImage from '../images/waiting.gif'
import ReactGA from 'react-ga';


ReactGA.initialize('UA-3712973-4');

export default function NavbarComponent(props) {
    //console.log(props)
    ReactGA.pageview(props.history.location.pathname);
    var astyle={paddingLeft:'0.3em'}
    const currentPage = props.history && props.history.location && props.history.location.pathname ? props.history.location.pathname : '/'
    const pages = {
        '/': {name: 'NLU Tool',show: false},
        '/search': {name: 'Search',show: true},//link:'https://github.com/syntithenai/opennludata/wiki'
        '/sources': {name: 'Sources',show: true},
        '/import': {name: 'Import',show: true},
        '/lists': {name: 'Entities',show: true},
        '/utterances': {name: 'Utterances',show: true},
        '/examples': {name: 'Intents',show: true},
        '/skills': {name: 'Skills',show: true},
        '/help': {name: 'Help',show: false},
        
    }
    
    const links = Object.keys(pages).map(function(link,k) {
        const page = pages[link]
        if (page.show) {
            if (page.link) {
                return <a key={k} style={astyle} href={page.link} ><Button variant='primary' >{page.name}</Button></a>                
            } else {
                return <Link key={k} style={astyle} to={link} ><Button variant={currentPage.indexOf(link) !== -1 ? 'success' : 'primary'}>{page.name}</Button></Link>
            }
        }
        return null
    })
    
    const helpButton = pages[currentPage] && pages[currentPage].helpComponent ? pages[currentPage].helpComponent : <Link to="/help" ><Button>Help</Button></Link>
    
//        <Navbar.Text><Button><img src='/menu.svg' alt='menu' /></Button></Navbar.Text>

    return <Navbar  bg="dark" variant="dark"  >
        {props.message && <div style={{position:'fixed',top:5,left:window.innerWidth ? (window.innerWidth /2 - 40) : 100, border: '2px solid red', background: 'pink', padding: '0.5em', minWidth:'400px' ,borderRadius:'5px'}} >
            <Button variant="danger" size="sm"  style={{float:'right', fontWeight: 'bold',borderRadius:'20px',marginLeft:'1em'}} onClick={function(e) {props.setPageMessage('')}}>X</Button>{props.message} 
        </div>}
    
        <img src={fireImage}  style={{height:'5em', marginRight:'0.4em'}} alt="logo"/>
        
         
        <div style={{width: '100%'}}>
        {links}
        </div>
        
        {props.message}
        <Navbar.Text style={{position:'fixed', top:'2px', right:'2px'}} className="justify-content-end" >{helpButton}</Navbar.Text>
        <img src={waitingImage} alt='waiting' style={{position:'fixed', top:5, right:5, zIndex:99, display: props.waiting ? 'block' : 'none' }} />
    </Navbar>
}


        //<Navbar.Text><Link to="/organise" ><Button>Organise</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/skills" ><Button>My Skills</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/search" ><Button>Search Community</Button></Link></Navbar.Text>
