
function getPoll(pollId){
    var poll = {}
    fetch(`http://localhost:9000/poll/${pollId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            poll=data;
        });
    console.log(poll)
    return poll;
}

export { getPoll }