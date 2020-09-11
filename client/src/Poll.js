import React, { useEffect, useState } from 'react'
import {
    useParams
  } from "react-router-dom";

function Poll(props){

    var {pollId} = useParams();
    const [poll, setPoll] = useState({});

    useEffect(() => {
        fetch(`http://localhost:9000/poll/${pollId}`)
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
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user: localStorage.getItem('userToken'),
                vote: event.target.alternativevote.value
            })
        };
        fetch(`http://localhost:9000/poll/${props.poll.id}/vote`, requestOptions)
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


    useEffect(() => {
        fetch(`http://localhost:9000/poll/${props.poll.id}/result`)
        .then(response => response.json())
        .then(data => setAnswers(data));
        console.log(props.poll.id)
    }, [props.poll.id]);

    function listAlternativesResults(){
        var zipped = (props.poll.alternatives || []).map((alt, i) => [alt, answers[i]]);
        const ans = zipped.map(([alt,num], index) =>  
        <li key={"alternativevote" + index}>
          {alt}: {num}
        </li> );
  
        //console.log(ans)
        return ans;
            
    }   

    return(
        <div>
            <p>Question: {props.poll.question}</p>
            <ul>
                {listAlternativesResults()}
            </ul>

        </div>
        )
}

export { Poll };