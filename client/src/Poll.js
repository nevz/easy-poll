import React, { useEffect, useState} from 'react'
import {
    useParams
  } from "react-router-dom";
import './Poll.css';
import { formatAlternative } from './util'



function Poll(props){

    var {pollId} = useParams();
    const [poll, setPoll] = useState({});

    useEffect(() => {
        fetch(process.env.REACT_APP_APIURL + pollId)
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
            <ol>{listAlternatives}</ol>
        </div>
    );
}

function VotePoll(props){


    const [vote, setVote] = useState(false);
    const listAlternatives = (props.poll.alternatives || []).map((alternative, index) => 
    <li key={"alternativevote" + index}>
        <input type="radio" name="alternativevote" value={index} /> <label>{alternative}</label>
    </li>    
    );

    function onSubmit(event){
        event.preventDefault();
        const vote = event.target.alternativevote.value;


        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user: localStorage.getItem('userToken'),
                vote: vote
            })
        };
        fetch(process.env.REACT_APP_APIURL + props.poll._id + "/vote", requestOptions)
            .then(response => response.json());
        
        setVote(vote);
    }

    function getVote(){
        if(vote){
            return(<div>You voted: <br/>{formatAlternative(props.poll.alternatives[vote], vote)}</div>)
        }
        else{
            return(<div>You haven't voted yet</div>)
        }
    }

    return(
        <div>
            <p>Question: {props.poll.question}</p>
            <form onSubmit={onSubmit}>
            <ol>
                {listAlternatives}
            </ol>
            <button type="submit">Submit</button>
            </form>
            {getVote()}
        </div>
        )
}

function ResultsPoll(props){

    const [answers, setAnswers] = useState([])


    function getResults(pollId){
        fetch(process.env.REACT_APP_APIURL + pollId + `/result`)
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

        fetch(process.env.REACT_APP_APIURL + props.poll._id + "/reset", requestOptions)
        .then(response => response.json())
        .then(data => setAnswers(data));
    }


    return(
        <div>
            <p>Question: {props.poll.question}</p>
            <ol>
                {listAlternativesResults()}
            </ol>

            <button type="button" onClick={() => resetResults()}>Reset</button>
            <button type="button" onClick={() => getResults(props.poll._id)}>Update</button>

        </div>
        )
}

export { Poll };