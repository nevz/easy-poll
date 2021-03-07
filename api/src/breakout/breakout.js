/**
 * Creates breakout rooms with the selected size, and sends people to them.
 * @param {int} groupSize the size of the groups to be created
 * @param {[participant]} participants the array containing all the jitsi participants
 * @param {boolean} fillUp wether to fill the groups with one more person if needed. put on false if you want some groups with less people groupSize
 * 
 */
function createRoomsBySize(groupSize, users, fillUp=true) {
    if(fillUp) return createRoomsByQuantity(Math.floor(users.length / groupSize), users);
    return createRoomsByQuantity(Math.ceil(users.length / groupSize), users);
}

/**
 * 
 * @param {*} quantity quantity of groups to be created
 * @param {*} users array containing all user ids
 */
function createRoomsByQuantity(quantity, users){
    if(quantity===0)quantity=1;

    let groupCounter = 0;

    let distribution = Array.from(Array(quantity), () => []);
    for(let user of users){
        distribution[groupCounter].push(user);
        console.log('pushing user ' + user + 'to group ' + groupCounter);
        groupCounter++;
        groupCounter = groupCounter%quantity;
    }

    return distribution;

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