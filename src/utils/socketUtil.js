const socketConnec = (io) => {
    let rooms = {};

    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        // socket.on('bktest', (e) => {
        //     console.log(e);
        // })
        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected`);
            for (let roomCode in rooms) {
                let room = rooms[roomCode];
                let index = room.findIndex(user => user.socketId === socket.id);

                if (index !== -1) {
                    const user = room.splice(index, 1)[0];

                    // Notify the room that the user has disconnected
                    io.to(roomCode).emit('room-update', {
                        message: `${user.username} has left the room`,
                        users: room, // Send the updated list of users
                    });

                    console.log(`User ${user.username} has left the room`);
                }
            }

        });
        socket.on('create-room', (obj) => {
            // console.log('received code to create room', obj)
            socket.join(obj.roomCode);


            if (!rooms[obj.roomCode]) {
                rooms[obj.roomCode] = [];
            }
            rooms[obj.roomCode].push({ socketId: socket.id, username: obj.userData.username, avatar: obj.userData.avatar, isHost: true });
            io.to(obj.roomCode).emit('room-update', {
                message: `User ${obj.userData.username} has joined the room`,
                users: rooms[obj.roomCode], // Send the list of users in the room
            });
            // io.to(obj.roomCode).emit('test', `testing ${JSON.stringify(obj)}`)
            // return 'hi';
        })
        socket.on('join-room', (obj) => {
            socket.join(obj.roomCode);
            // console.log('received d', obj);
            if (!rooms[obj.roomCode]) {
                rooms[obj.roomCode] = [];
            }

            rooms[obj.roomCode].push({ socketId: socket.id, username: obj.userData.username, avatar: obj.userData.avatar, isHost: false });

            // Notify the room about the new user joining
            io.to(obj.roomCode).emit('room-update', {
                message: `👋 ${obj.userData.username} joined the room.`,
                users: rooms[obj.roomCode], // Send the list of users in the room
            });
            // io.to(obj.roomCode).emit('test', `testing if joined ${JSON.stringify(obj)}`)
        })
        socket.on('start-game', (roomCode) => {
            const room = rooms[roomCode];
            const host = room?.find(u => u.isHost);
            if (host?.socketId === socket.id) {
                io.to(roomCode).emit('game-start');
            } else {
                socket.emit('error-message', 'Only the host can start the game.');
            }
        });
    });
}
export default socketConnec;