import { Router } from 'express';
import { ObjectId } from 'mongoose';
import { stringify, v4 as uuidv4 } from 'uuid';

//in this file are all the routes allowing to make requests to the poll Api

const router = Router();

//gets all the poll data
router.get('/', async (req, res) => {
    const polls = await req.context.models.Poll.find();
    return res.send(polls);
});

//gets the data for the poll with id pollId
router.get('/:pollId', async (req, res) => {
    const id = req.params.pollId;
    const poll = await req.context.models.Poll.findById(id);
    return res.send(poll);
});


//adds a new poll
router.post('/', async (req, res) => {
    const newPoll = await req.context.models.Poll.create(
        {
        question: req.body.question,
        alternatives: req.body.alternatives,
        votes: {}
    });
    return res.send(newPoll);
});


// adds or modifies a vote on the poll with id pollId
router.post('/:pollId/vote', async (req, res) => {
    const id = req.params.pollId;
    var poll = await req.context.models.Poll.findById(id);
    var votes = poll.votes;
    votes.set(req.body.user, req.body.vote);
    poll.votes = votes;
    await poll.save();
    return res.send(poll);
});


//resets the votes of the poll with id pollId
router.post('/:pollId/reset', async (req, res) => {
    const id = req.params.pollId;
    var poll = await req.context.models.Poll.findById(id);
    var votes = poll.votes;
    votes.clear();

    poll.votes = votes;
    poll.markModified('votes');
    
    await poll.save(err => {
        if(err){
            console.log(err);
            return;
        }
    });
    const results = getResults(poll);
    return res.send(results);
});


//returns the results of the poll with id pollId, the are in an array withe the following format [optionIndex: numberOfVotes]
router.get('/:pollId/result', async (req, res) => {    
    const id = req.params.pollId;
    if(!id){
        return res.send([]);
    }
    req.context.models.Poll.findById(id)
    .then(poll => {
        const results = getResults(poll);
        return res.send(results);
    }).catch(error => {
        error;
    });
    
});

// gets all answers for a poll in a list
// 
router.get('/:pollId/answers', async (req, res) => {    
    const id = req.params.pollId;
    if(!id){
        return res.send([]);
    }
    req.context.models.Poll.findById(id)
    .then(poll => {
        const answers = poll.votes;
        return res.send(answers);
    }).catch(error => {
        error;
    });
    
});


//auxiliary function, gets the results for a poll
function getResults(poll){
    const n = poll.alternatives.length
    var answers = new Array(n).fill(0);
    for (const [user, vote] of poll.votes.entries()) {
        answers[vote] += 1
    }
    return answers;
}

/*
//removes the poll with id pollId from the database.
//should stay disabled until some verification can be done so its not unsafe.
router.delete('/:pollId', async (req, res) => {
    const id = req.params.pollId;
    const poll = await req.context.models.Poll.findById(id);

    if(poll){
        await poll.remove();
    }
    return res.send(poll);
})
*/

export default router;