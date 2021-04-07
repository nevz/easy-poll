
function createRooms(size, users, breakoutOption, smartBreakoutOption, poll) {
    if (breakoutOption === 'byNumber') {
        return createRoomsByQuantity(size, users, smartBreakoutOption, poll);
    }
    return createRoomsBySize(size, users, smartBreakoutOption, poll);
}
/**
 * Creates breakout rooms with the selected size, and sends people to them.
 * @param {int} groupSize the size of the groups to be created
 * @param {Set<String>} userIDs the set containing all the jitsi participants
 * 
 */
function createRoomsBySize(groupSize, userIDs, smartBreakoutOption, poll) {
    return createRoomsByQuantity(Math.floor(userIDs.length / groupSize), userIDs, smartBreakoutOption, poll);

    //(if fillup false)
    //return createRoomsByQuantity(Math.ceil(users.length / groupSize), users);
}

/**
 * 
 * @param {*} numberOfGroups quantity of groups to be created
 * @param {*} userIDs array containing all user ids
 */
function createRoomsByQuantity(numberOfGroups, userIDs, smartBreakoutOption, poll) {
    if (smartBreakoutOption === 'sameAnswers') {
        return sameAnswerDistribution(numberOfGroups, userIDs, poll);
    }
    else if (smartBreakoutOption === 'differentAnswers') {
        return differentAnswersDistribution(numberOfGroups, userIDs, poll);
    }
    else if (smartBreakoutOption === 'random') {
        return randomDistribution(numberOfGroups, userIDs, poll);
    }
}

function randomDistribution(numberOfGroups, userIDs, poll) {
    if (numberOfGroups === 0) numberOfGroups = 1;
    let groupCounter = 0;
    shuffle(userIDs);
    let distribution = Array.from(Array(numberOfGroups), () => []);
    for (let user of userIDs) {
        distribution[groupCounter].push(user);
        console.log('pushing user ' + user + 'to group ' + groupCounter);
        groupCounter++;
        groupCounter = groupCounter % numberOfGroups;
    }

    showDistribution(distribution, poll);
    return distribution;
}


function sameAnswerDistribution(numberOfGroups, userIDs, poll) {
    if (numberOfGroups === 0) numberOfGroups = 1;
    const groupSize = Math.floor(userIDs.length / numberOfGroups);
    const answers = poll.votes;
    let distribution = [];
    let buckets = separateByAnswers(userIDs, poll);
    let groupCounter = 0;
    let previousNumberOfGroups = 0;
    for (let bucket of buckets) {
        let groupCounter = previousNumberOfGroups;
        const numberOfGroupsForThisBucket = Math.max(Math.floor(bucket.length / groupSize),1);
        for (let i = previousNumberOfGroups; i < (previousNumberOfGroups + numberOfGroupsForThisBucket); i++) {
            distribution[i] = [];
        }
        while (bucket.length > 0) {
            distribution[groupCounter].push(bucket.pop());
            groupCounter++;
            groupCounter = ((groupCounter - previousNumberOfGroups) % numberOfGroupsForThisBucket) + previousNumberOfGroups;
        }
        previousNumberOfGroups += numberOfGroupsForThisBucket;

    }
    showDistribution(distribution, poll);
    return distribution;
}


function differentAnswersDistribution(numberOfGroups, userIDs, poll) {
    if (numberOfGroups === 0) numberOfGroups = 1;

    let distribution = Array.from(Array(numberOfGroups), () => []);
    let buckets = separateByAnswers(userIDs, poll);
    let groupCounter = 0;

    for (let bucket of buckets) {
        while (bucket.length > 0) {
            distribution[groupCounter].push(bucket.pop())
            groupCounter++;
            groupCounter = groupCounter%numberOfGroups;
        }
    }

    showDistribution(distribution, poll);

    return distribution;

}

function separateByAnswers(userIDs, poll) {
    const answers = poll.votes;
    const numberOfBuckets = poll.alternatives.length + 1;
    let buckets = Array.from(Array(numberOfBuckets), () => []);
    //we separate participants in buckets, according to their answers
    for (const userID of userIDs) {
        if (answers.get(userID)!==undefined) {
            buckets[answers.get(userID)].push(userID);
        }
        else {
            buckets[numberOfBuckets - 1].push(userID);
        }
    }
    console.log("the buckets are :", buckets);
    return buckets;
}



function sendToBreakout(socket, roomName, distribution, roomStore, pollId) {
    let roomCounter = 0;
    const breakoutRoomNames = [];
    for (let group of distribution) {
        roomCounter++;
        const breakoutRoomName = roomName + 'easyFlipRoom' + roomCounter;
        breakoutRoomNames.push(breakoutRoomName);
        const newRoom = roomStore.newRoom(breakoutRoomName, undefined, roomName, pollId);
        for (let userID of group) {
            socket.to(userID).emit('notifyBreakout', { breakoutRoomName: breakoutRoomName, originalRoomName: roomName });
            console.log('sending user ' + userID + ' to breakout room ' + breakoutRoomName);
        }
    }

    roomStore.getRoom(roomName).breakoutRooms = breakoutRoomNames;
    socket.emit('roomsCreated', breakoutRoomNames);
}

//shuffles an array, taken from stackoverflow
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function showDistribution(distribution, poll) {
    let i = 0;
    console.log("the distribution is ");
    for (const arr of distribution) {
        console.log("group number ", i, ":");
        i++;
        for (const user of arr) {
            console.log(user, ":", poll.votes.get(user));
        }
    }
}

export { createRooms, sendToBreakout };

//This is for testing
/*
function getRandomInt(max) {
    const randomNumber = Math.floor(Math.random() * (1+Math.floor(max)))
    if(randomNumber===Math.floor(max)){
        return undefined;
    }
    else{
        return randomNumber;
    }
}
let userIDs = [];
shuffle(userIDs);
let poll = {
    votes: new Map(),
    alternatives: [1, 2, 3]
}
for (let i = 0; i < 41; i++) {
    userIDs.push(String(i));
    poll.votes.set(String(i), getRandomInt(poll.alternatives.length));
}

console.log(poll);
const dist = createRoomsByQuantity(6, userIDs, 'sameAnswers', poll); 
*/
