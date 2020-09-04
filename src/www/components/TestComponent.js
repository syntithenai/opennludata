/* global window */
import React , {useState, useEffect} from 'react';
import request from 'request'
import useRestEndpoint from './../useRestEndpoint'

export default function TestComponent(props) {
    //console.log(props)
    //const [axiosClient,setAxiosClient] = useState(null)
    
    const token = props.user && props.user.token && props.user.token.access_token ? props.user.token.access_token : ''
    const axiosClient = props.getAxiosClient(token)
    const {saveItem, deleteItem, getItem, searchItems} = useRestEndpoint(axiosClient)
    
    return <div>rfrr
    
    <button onClick={function(e) {saveItem('Skill',{_id:"5f483aa1f46f025d916aa7e5", title:'aaaa',json:JSON.stringify({})})}} >POST</button>
    
    </div>
}


        //<Navbar.Text><Link to="/organise" ><Button>Organise</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/skills" ><Button>My Skills</Button></Link></Navbar.Text>
        //<Navbar.Text><Link to="/search" ><Button>Search Community</Button></Link></Navbar.Text>
