import React, {useState} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {Button, Modal} from 'react-bootstrap'
import { Link  } from 'react-router-dom'

function SearchPage(props) {
    const [copied, setCopied] = useState(false)
    
    
    return <div>
    <h3>Search</h3>
    <iframe src="https://github.com/syntithenai/opennludata/wiki" ></iframe>
    
    
    </div>
    
    
}

export default SearchPage
