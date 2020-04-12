const users = [];

//Join user to chat
function userJoin(id, username, room, gender){
    const user = {id, username, room, gender};

    users.push(user);

    return user;
}

//Get currentt user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    let usersInRoom = users.filter(user => user.room === room);
    return usersInRoom;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}