import React, { useState } from 'react';
import { Poll } from './'

function NewPoll() {
    const [postData, setPostData] = useState({});
    
    const [question, setQuestion] = useState("");
    const [alternatives, setAlternatives] = useState(["Alternative A", "Alternative B", "Alternative C"])

    const listAlternatives = alternatives.map((alternative, index) => 
        <li key={"alternative" + index}>
            <input name={alternative + index} type="text" value={alternative} onChange={(e) => alternativeChange(e, index)}/>
            <button type="button" onClick={(e) => deleteAlternative(e, index)}> X </button>
        </li>    
    )

    function deleteAlternative(event, index){
        var newAlternatives = [...alternatives];
        newAlternatives.splice(index, 1);
        setAlternatives([...newAlternatives])

    }

        function alternativeChange(event, index){
        const updatedValue = event.target.value;
        var newAlternatives = [...alternatives];
        newAlternatives[index] = updatedValue;
        setAlternatives([...newAlternatives]);
    }

    function questionChange(event){
        setQuestion(event.target.value)
    }

    function addAlternative(event){
        const newAlternatives = alternatives.concat(["New alternative"]);
        setAlternatives([...newAlternatives]);
    }
    
    function makePostRequest(event){
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: question,
                alternatives: alternatives
            })
        };
        fetch('http://localhost:9000/poll', requestOptions)
            .then(response => response.json())
            .then(data => {
                setPostData(data)
            });
    }

    return (
        <div>
            <p>You just posted:</p>
            <p>{postData.question}</p>
            <ul>{ (postData.alternatives || []).map((alternative, index)=>
                <li key={alternative+index}>{alternative}</li>)}
            </ul>
            <form onSubmit={makePostRequest}>
                <label>
                    Question:
                    <input value={question} type="text" name="name" onChange={questionChange}/>
                </label>
                <ul>{listAlternatives}</ul>
                <button type="button" onClick={addAlternative}>Add Alternative</button>

                <input type="submit" value="Submit"/>
            </form>
            <Poll id={postData.id || 1} mode="vote" />

        </div>
    );
}

export { NewPoll };