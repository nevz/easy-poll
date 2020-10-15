import React, { useState } from 'react';
import {
    Link
  } from "react-router-dom";


function NewPoll() {
    const [postData, setPostData] = useState(null);
    
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
        fetch(process.env.REACT_APP_APIURL, requestOptions)
            .then(response => response.json())
            .then(data => {
                setPostData(data)
            });
    }

    function getPostedQuestion(){
        if(postData){
            return(
            <div>
                <p>You just posted:</p>
                <p>{postData.question}</p>
                <ol>{ (postData.alternatives || []).map((alternative, index)=>
                    <li key={alternative+index}>{alternative}</li>)}
                </ol>
                <Link to={postData._id + "/vote"}>Vote here</Link><br/>
                <Link to={postData._id + "/results"}>See results here</Link>
            </div>
            )
        }
        return(<div></div>)
    }

    return (
        <div>
            {getPostedQuestion()}
            
            <form onSubmit={makePostRequest}>
                <label>
                    Question:
                    <input value={question} type="text" name="name" onChange={questionChange}/>
                </label>
                <ol>{listAlternatives}</ol>
                <button type="button" onClick={addAlternative}>Add Alternative</button>

                <input type="submit" value="Submit"/>
            </form>
        </div>
    );
}

export { NewPoll };