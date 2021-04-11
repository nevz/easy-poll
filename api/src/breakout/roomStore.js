class Room {
    /**
     * 
     * @param {String} roomName the name of the room
     * @param {String} owner the userId of the user who owns this room
     * @param {String} parentRoomName the name of the parent of this room, undefined if there is none
     * @param {String} pollId the Id of the current poll in this room, undefined if there is none
     */
    constructor(roomName, owner, parentRoomName, pollId = undefined) {
        this.parent = parentRoomName;
        this.roomName = roomName;
        this.owner = owner;
        this.connectedUsers = new Set();
        this.pollId = pollId;
        this.breakoutRooms = [];
    }
}

/* abstract */ class RoomStore {
    newUser(userId) { }
    removeUser(userId) { }
    newRoom(roomName, ownerId, parentRoomName) { }
    getRoom(roomName) { }
    getUsers(roomName) { }
    joinRoom(roomName, userId) { }
    leaveRoom(roomName, userId) { }
    setPoll(roomName, pollId) { }
    getPoll(roomName, pollId) { }
    getBreakoutRoomsForRoom(roomName) { }

}

class InMemoryRoomStore extends RoomStore {
    constructor() {
        super();
        this.rooms = new Map(); //stores roomId -> Room
        this.users = new Map(); // stores userId -> [rooms]
    }

    /**
     * 
     * @param {String} userId 
     * adds a new user to the room store
     */
    newUser(userId) {
        this.users.set(userId, new Set());
    }

    /**
     * Removes a user from the store
     * @param {string} userId the id of the user to remove
     */
    removeUser(userId) {
        this.users.delete(userId);
    }

    /**
     * @param {str} roomName the name of the room
     * @param {str} ownerId the id of the owner of the room
     * @param {str} parentRoomName the name of the room that generated this one
     * @returns {Room} the room that was created
     */
    newRoom(roomName, ownerId, parentRoomName, pollId = undefined) {
        let room = new Room(roomName, ownerId, parentRoomName, pollId);
        this.rooms.set(roomName, room);
        if (ownerId) {
            room.connectedUsers.add(ownerId);
            this.users.get(ownerId).add(roomName);
        }
        return room;
    }

    /**
     * Room getter
     * @param {str} roomName the name of the room to get
     * @returns {Room} the room
     */
    getRoom(roomName) {
        return this.rooms.get(roomName);
    }

    /**
     * 
     * @param {*} roomName 
     * @returns 
     */
    getUsers(roomName) {
        return this.rooms.get(roomName).connectedUsers;
    }

    /**
     * This method adds a user to a room, if the room doesn't exist, then a new room is created
     * @param {string} roomName The name of the room to join
     * @param {string} userId the id of the user that is being added to the room
     * @returns {Room} the room that was just joined
     */
    joinRoom(roomName, userId) {
        let roomToJoin = this.rooms.get(roomName);
        if (roomToJoin === undefined) {
            console.log('creating new room')
            return this.newRoom(roomName, userId);
        }
        roomToJoin.connectedUsers.add(userId);
        this.users.get(userId).add(roomName);


        return roomToJoin;
    }

    /**
     * Makes an user leave a room, if the room is empty after the user leaves, then it is deleted
     * @param {string} roomName the name of the room to leave
     * @param {string} userId the id of the user that's leaving
     */
    leaveRoom(roomName, userId) {
        console.log(userId, " has left the room ", roomName);
        const roomToLeave = this.rooms.get(roomName);
        roomToLeave.connectedUsers.delete(userId);
        this.users.get(userId).delete(roomName);
        if (roomToLeave.connectedUsers.size === 0) {
            this.rooms.delete(roomName);
        }
    }

    /**
     * All rooms getter
     * @returns {Array<Room>} An array with all the rooms
     */
    getAllRooms() {
        return [...this.rooms.values()];
    }


    /**
     * Gets all th{e rooms for an user
     * @param {string} userId the id of the user
     * @returns {Array<Room>}
     */
    getRoomsForUser(userId) {
        return this.users.get(userId);
    }

    /**
     * Sets a poll for a room
     * @param {string} roomName the name of the room
     * @param {string} pollId the id of the poll to set
     */
    setPoll(roomName, pollId) {
        this.getRoom(roomName).pollId = pollId;
    }

    /**
     * Gets the id of the poll in the room with the pollId
     * @param {string} roomName the name of the room
     * @returns {string}
     */
    getPoll(roomName) {
        return this.getRoom(roomName).pollId;
    }



    /**
     * Returns an array with all the breakout rooms that were created from this room
     * @param {string} roomName The name of the room
     * @returns {Array<Room>} The array with the rooms
     */
    getBreakoutRoomsForRoom(roomName) {
        let breakoutRooms = []
        for (let name of this.getRoom(roomName).breakoutRooms) {
            const room = this.getRoom(name)
            if (room) {
                breakoutRooms.push(room);
            }
        }
        return breakoutRooms;
    }


}

export { InMemoryRoomStore };
