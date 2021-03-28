class Room{
    constructor(roomName, owner, parentRoomName, pollId=undefined){
        this.parent = parentRoomName
        this.roomName = roomName;
        this.owner = owner;
        this.connectedUsers = new Set();
        this.pollId = pollId;
    }
}

/* abstract */ class RoomStore {
    newRoom(roomName, ownerId, parentRoomName) {}
    getRoom(roomName) {}
    getUsers(roomName) {}
    joinRoom(roomName, userId) {}
    leaveRoom(roomName, userId) {}
    setPoll(roomName, pollId) {}
    getPoll(roomName, pollId) {}
    newUser(userId) {}

  }
  
  class InMemoryRoomStore extends RoomStore {
    constructor() {
        super();
        this.rooms = new Map(); //stores roomId -> Room
        this.users = new Map(); // stores userId -> [rooms]
    }
  

    newUser(userId){
        this.users.set(userId, new Set());
    }

    /**
     * 
     * @param {str} roomName the name of the room
     * @param {str} ownerId the id of the owner of the room
     * @param {str} parentRoomName the name of the room that generated this one
     */
    newRoom(roomName, ownerId, parentRoomName, pollId=undefined) {
        let room = new Room(roomName, ownerId, parentRoomName, pollId);
        this.rooms.set(roomName, room);
        if(ownerId){
            room.connectedUsers.add(ownerId);
            this.users.get(ownerId).add(roomName);
        }
        return room;
    }

    getRoom(roomName){
        return this.rooms.get(roomName);
    }

    joinRoom(roomName, userId){
        let roomToJoin = this.rooms.get(roomName);
        if(roomToJoin === undefined){
            console.log('creating new room')
            return this.newRoom(roomName, userId);
        }
        roomToJoin.connectedUsers.add(userId);
        this.users.get(userId).add(roomName);


        return roomToJoin;
    }

    leaveRoom(roomName, userId) {
        console.log(userId, " has left the room ", roomName);
        const roomToLeave = this.rooms.get(roomName);
        roomToLeave.connectedUsers.delete(userId);
        this.users.get(userId).delete(roomName);
        if(roomToLeave.connectedUsers.size === 0){
            this.rooms.delete(roomName);
        }
        //this.rooms.set(roomName, roomToLeave);
    }

    getAllRooms(){
        return [...this.rooms.values()];
    }


    getRoomsForUser(userId){
        return this.users.get(userId);
    }


    setPoll(roomName, pollId) {
        this.getRoom(roomName).pollId=pollId;
    }

    getPoll(roomName){
        return this.getRoom(roomName).pollId;
    }

    getUsers(roomName){
        return this.rooms.get(roomName).connectedUsers;
    }
  }
  
export { InMemoryRoomStore }; 
