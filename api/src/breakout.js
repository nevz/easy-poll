/**
 * Creates breakout rooms with the selected size, and sends people to them.
 * @param {int} groupSize the size of the groups to be created
 * @param {[participant]} participants the array containing all the jitsi participants
 * @param {boolean} fillUp wether to fill the groups with one more person if needed. put on false if you want some groups with less people groupSize
 * 
 */
function createRoomsBySize(groupSize, sockets, fillUp=true) {
    if(fillUp) return createRoomsByQuantity(Math.floor(participants.length / groupSize), sockets);
    return createRoomsByQuantity(Math.ceil(participants.length / groupSize), sockets);
}

/**
 * 
 * @param {*} quantity quantity of groups to be created
 * @param {*} participants array containing all jitsi participants
 */
function createRoomsByQuantity(quantity, participants){
    if(quantity===0)quantity=1;
    let groups = generateGroups(quantity);
    let groupCounter = 0; //group counter
    for(let p of participants){
        sendToBreakout(p, groups[groupCounter]);
        groupCounter++;
        groupCounter = groupCounter%quantity;

    }
}

function sendToBreakout(participant, breakoutURL){
    //this.props.dispatch(setPrivateMessageRecipient(participant));
    //this.props.dispatch(sendMessage(breakoutURL));
    console.log(participant)
    console.log("sending " + participant.participantId + " to breakout " + breakoutURL);
    return;
};

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