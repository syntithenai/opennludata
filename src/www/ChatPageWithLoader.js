import React, {Fragment, useState, useEffect, useContext, useRef} from 'react';
import {Container, Row, Col, ListGroup, Button, Accordion, Card, AccordionContext, Modal} from 'react-bootstrap'
import { Link , useParams } from 'react-router-dom'
import  ChatPage  from './ChatPage'
import useSkillsEditor from './useSkillsEditor'
import {exportJSON} from './export/exportJSON'

function ChatPageWithLoader(props) {
    console.log(['cjhat;lpader',props]) 
    const params = useParams()
    const [currentExport,setCurrentExport] = useState(null)
    const [currentSkillHere,setCurrentSkillHere] = useState(null)
    const {currentSkill} = useSkillsEditor(Object.assign({},props,{user:props.user, lookups: props.lookups, updateFunctions: props.updateFunctions}))
            
    //useEffect(() => {
        //console.log(['CHATLOADER load',props.currentSkill,currentSkill]); 
        //if (props.currentSkill) {
            //setCurrentSkillHere(props.currentSkill)
        //} else {
            //// try from skill id parameter using skills editor
            //setCurrentSkillHere(currentSkill)
        //}
    //},[])
    useEffect(() => {
        if (props.currentSkill) {
            exportJSON(currentSkill).then(function(exported) {
                //console.log(['CHATLOADER',exported]); 
                setCurrentExport(exported)
            })
        } else if (currentSkill) {
            exportJSON(currentSkill).then(function(exported) {
                //console.log(['CHATLOADER',exported]); 
                setCurrentExport(exported)
            })
        }
    },[currentSkill,props.currentSkill])
    if (currentExport) {
        
        return <ChatPage {...props} currentSkill={currentExport} />
    } else {
        return null
    }
}
export default ChatPageWithLoader
