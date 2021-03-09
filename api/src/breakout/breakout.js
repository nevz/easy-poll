/**
 * Creates breakout rooms with the selected size, and sends people to them.
 * @param {int} groupSize the size of the groups to be created
 * @param {[participant]} participants the array containing all the jitsi participants
 * @param {boolean} fillUp wether to fill the groups with one more person if needed. put on false if you want some groups with less people groupSize
 * 
 */
function createRoomsBySize(groupSize, userIDs, smartBreakoutOption, asnwers) {
    return createRoomsByQuantity(Math.floor(userIDs.length / groupSize), userIDs, smartBreakoutOption, answers);
    
    //(if fillup false)
    //return createRoomsByQuantity(Math.ceil(users.length / groupSize), users);
}

/**
 * 
 * @param {*} numberOfGroups quantity of groups to be created
 * @param {*} userIDs array containing all user ids
 */
function createRoomsByQuantity(numberOfGroups, userIDs, smartBreakoutOption){

    if(smartBreakoutOption==='sameAnswers'){
        return randomDistribution(numberOfGroups, userIDs);
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

    let distribution = Array.from(Array(numberOfGroups), () => []);
    for(let user of userIDs){
        distribution[groupCounter].push(user);
        console.log('pushing user ' + user + 'to group ' + groupCounter);
        groupCounter++;
        groupCounter = groupCounter%numberOfGroups;
    }

    return distribution;
}

function sameAnswerDistribution(numberOfGroups, userIDs, answers){
    return;
}


/**
* 
* @param {int} n A number to help generate the name of the room 
*/
function generateBreakoutRoomURL(roomURL, n){
    return roomURL + 'easyfliproom' + n;
}

function generateGroups(quantity){
    let groups = []
    for(let i = 0; i<quantity; i++){
        groups.push(generateBreakoutRoomURL("breakoutUrl", i))
    }
    return groups;
}

export {createRoomsByQuantity, createRoomsBySize};