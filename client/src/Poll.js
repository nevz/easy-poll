import React, { useEffect, useState } from 'react'
import {
    useParams
  } from "react-router-dom";
import { APIURL } from './constants';
import './Poll.css';


function Poll(props){

    var {pollId} = useParams();
    const [poll, setPoll] = useState({});

    useEffect(() => {
        fetch(APIURL + pollId)
        .then(response => response.json())
        .then(data => {
            setPoll(data);
        });
    }, [pollId]);

    function displayPoll(){
        if(props.mode==="vote"){
            return(
                <VotePoll poll={poll} /> 
            )
        }
        else if(props.mode==="results"){
            return(
                <ResultsPoll poll={poll} />
            )
        }
        return (
            <DisplayPoll poll={poll} />
        )
    }

    return(
        displayPoll()
    )
} 


function DisplayPoll(props){
    const listAlternatives = (props.poll.alternatives || []).map((alternative, index) => 
    <li key={"alternativedisplay" + index}>
        {alternative}
    </li>    
    );

    return(
        <div>
            <p>Question: {props.poll.question}</p>
            <p>Alternatives:</p>
            <ul>{listAlternatives}</ul>
        </div>
    );
}

function VotePoll(props){

    const listAlternatives = (props.poll.alternatives || []).map((alternative, index) => 
    <li key={"alternativevote" + index}>
        <input type="radio" name="alternativevote" value={index} /> <label>{alternative}</label>
    </li>    
    );

    function onSubmit(event){
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user: localStorage.getItem('userToken'),
                vote: event.target.alternativevote.value
            })
        };
        fetch(APIURL + props.poll._id + "/vote", requestOptions)
            .then(response => response.json());

    }

    return(
        <div>
            <p>Question: {props.poll.question}</p>
            <form onSubmit={onSubmit}>
            <ul>
                {listAlternatives}
            </ul>
            <button type="submit">Submit</button>

            </form>
        </div>
        )
}

function ResultsPoll(props){

    const [answers, setAnswers] = useState([])


    function getResults(pollId){
        fetch(APIURL + pollId + `/result`)
        .then(response => response.json())
        .then(data => setAnswers(data));
    }

    useEffect(() => {
        getResults(props.poll._id);
    }, [props.poll._id]);

    function listAlternativesResults(){
        var zipped = (props.poll.alternatives || []).map((alt, i) => [alt, answers[i]]);
        const ans = zipped.map(([alt,num], index) =>  
        <li key={"alternativevote" + index}>
          {alt}: {num}
        </li> );
        return ans;
            
    }   

    function resetResults(event){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user: localStorage.getItem('userToken'),
            })
        };

        fetch(APIURL + props.poll._id + "/reset", requestOptions)
        .then(response => response.json());

        getResults(props.poll._id);

        console.log(props.poll._id);
    }


    return(
        <div>
            <p>Question: {props.poll.question}</p>
            <ul>
                {listAlternativesResults()}
            </ul>

            <button type="button" onClick={resetResults}>Reset</button>
            <button type="button" onClick={() => getResults(props.poll._id)}>Update</button>

        </div>
        )
}

export { Poll };