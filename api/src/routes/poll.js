import { Router } from 'express';
import { ObjectId } from 'mongoose';
import { stringify, v4 as uuidv4 } from 'uuid';


const router = Router();

router.get('/', async (req, res) => {
    const polls = await req.context.models.Poll.find();
    return res.send(polls);
});

router.get('/:pollId', async (req, res) => {
    const id = req.params.pollId;
    const poll = await req.context.models.Poll.findById(id);
    return res.send(poll);
});


router.post('/', async (req, res) => {
    const newPoll = await req.context.models.Poll.create(
        {
        question: req.body.question,
        alternatives: req.body.alternatives,
        votes: {}
    });
    return res.send(newPoll);
});


router.post('/:pollId/vote', async (req, res) => {
    const id = req.params.pollId;
    var poll = await req.context.models.Poll.findById(id);
    var votes = poll.votes;
    votes.set(req.body.user, req.body.vote);
    poll.votes = votes;
    await poll.save();
    return res.send(poll);
});


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
        console.log("hola");
    });
    
});

function getResults(poll){
    const n = poll.alternatives.length
    var answers = new Array(n).fill(0);
    for (const [user, vote] of poll.votes.entries()) {
        answers[vote] += 1
    }
    return answers;
}

router.delete('/:pollId', async (req, res) => {
    const id = req.params.pollId;
    const poll = await req.context.models.Poll.findById(id);

    if(poll){
        await poll.remove();
    }
    return res.send(poll);
})

export default router;