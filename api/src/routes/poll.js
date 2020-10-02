import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req, res) => {
    return res.send(Object.values(req.context.models.polls))
});

router.get('/:pollId', (req, res) => {
    return res.send(req.context.models.polls[req.params.pollId]);
});


router.post('/', (req, res) => {
    const id = uuidv4();
    const poll = {
        id,
        question: req.body.question,
        alternatives: req.body.alternatives,
        votes: {}
    };
    req.context.models.polls[id] = poll
    return res.send(poll);
})


router.post('/:pollId/vote', (req, res) => {
    const id = req.params.pollId
    var updatedPoll = req.context.models.polls[id];
    updatedPoll.votes[req.body.user] = req.body.vote;
    req.context.models.polls[id] = updatedPoll;
    return res.send(req.context.models.polls[id]);
});


router.post('/:pollId/reset', (req, res) => {
    const id = req.params.pollId
    var updatedPoll = req.context.models.polls[id];

    if(!updatedPoll){
        return res.send({});
    }

    updatedPoll.votes = {};
    req.context.models.polls[id] = updatedPoll;
    return res.send(req.context.models.polls[id]);
});


router.get('/:pollId/result', (req, res) => {

    const id = req.params.pollId;
    var poll = req.context.models.polls[id];
    if(!poll){
        return res.send([]);
    }
    const n = poll.alternatives.length
    var answers = new Array(n).fill(0);
    for (const [user, vote] of Object.entries(poll.votes)) {
        answers[vote] += 1
    }

    return res.send(answers);
});


router.delete('/:pollId', (req, res) => {
    const {
        [req.params.pollId]: poll,
        ...otherPolls
      } = req.context.models.polls;

    req.context.models.polls = otherPolls;
    return res.send(poll);
})

export default router;