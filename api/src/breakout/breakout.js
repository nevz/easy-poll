
function createRooms(size, users, breakoutOption, smartBreakoutOption, answers){
    if(breakoutOption === 'byNumber'){
        return createRoomsByQuantity(size, users, smartBreakoutOption, answers);
    }
    return createRoomsBySize(size, users, smartBreakoutOption, answers);
}
/**
 * Creates breakout rooms with the selected size, and sends people to them.
 * @param {int} groupSize the size of the groups to be created
 * @param {[participant]} participants the array containing all the jitsi participants
 * @param {boolean} fillUp wether to fill the groups with one more person if needed. put on false if you want some groups with less people groupSize
 * 
 */
function createRoomsBySize(groupSize, userIDs, smartBreakoutOption, answers) {
    return createRoomsByQuantity(Math.floor(userIDs.length / groupSize), userIDs, smartBreakoutOption, answers);
    
    //(if fillup false)
    //return createRoomsByQuantity(Math.ceil(users.length / groupSize), users);
}

/**
 * 
 * @param {*} numberOfGroups quantity of groups to be created
 * @param {*} userIDs array containing all user ids
 */
function createRoomsByQuantity(numberOfGroups, userIDs, smartBreakoutOption, answers){

    if(smartBreakoutOption==='sameAnswers'){
        return sameAnswerDistribution(numberOfGroups, userIDs, answers);
    }
    else if(smartBreakoutOption==='differentAnswers'){
        return randomDistribution(numberOfGroups, userIDs);
    }
    if(smartBreakoutOption==='random'){
        return randomDistribution(numberOfGroups, userIDs);
    }

}

function randomDistribution(numberOfGroups, userIDs){
    if(numberOfGroups===0)numberOfGroups=1;
    let groupCounter = 0;
    // falta permutacion
    let distribution = Array.from(Array(numberOfGroups), () => []);
    for(let user of userIDs){
        distribution[groupCounter].push(user);
        console.log('pushing user ' + user + 'to group ' + groupCounter);
        groupCounter++;
        groupCounter = groupCounter%numberOfGroups;
    }

    console.log('the distribution is ', distribution);
    return distribution;
}

function sameAnswerDistribution(numberOfGroups, userIDs, answers){
    let groupedUserIDs = {};
    for(const [userID, answer] of answers.entries()){
        console.log('user ', userID, 'answered ', answer);
    }
    for(const userID of userIDs){

    }

    return;
}

function sendToBreakout(socket, roomName, distribution, roomStore){
    let roomCounter = 0;
    const breakoutRoomNames = []
    for(let group of distribution){
        roomCounter++;
        const breakoutRoomName = roomName + 'easyFlipRoom' + roomCounter;
        breakoutRoomNames.push(breakoutRoomName);
        const newRoom = roomStore.newRoom(breakoutRoomName, undefined, roomName);
        for(let userID of group){
            socket.to(userID).emit('notifyBreakout', {breakoutRoomName: breakoutRoomName, originalRoomName: roomName});
            console.log('sending user ' + userID + ' to breakout room ' + breakoutRoomName);
        }
    }
    socket.emit('roomsCreated', breakoutRoomNames);
}

export {createRooms, sendToBreakout};