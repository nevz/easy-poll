import React, { useEffect, useState } from 'react'

function Poll(props){

    var pollId = props.id;
    const [poll, setPoll] = useState({});

    const listAlternatives = (poll.alternatives || []).map((alternative, index) => 
    <li key={"alternativex" + index}>
        {alternative}
    </li>    
    );

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
    )
}

function VotePoll(props){

    const listAlternatives = (props.poll.alternatives || []).map((alternative, index) => 
    <li key={"alternativevote" + index}>
        <input type="radio" name="alternativevote" value={index} /> <label>{alternative}</label>
    </li>    
    );

    function onSubmit(event){
        event.preventDefault();
        console.log("submitted" + event.target.alternativevote.value);
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

export { Poll };