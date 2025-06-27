import fs from 'fs/promises';

const socketConnec = (io) => {
    let rooms = {};
    let timer = {};
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        // socket.on('bktest', (e) => {
        //     console.log(e);
        // })
        socket.on('score-update', (data) => {
            for (let roomCode in rooms) {
                let room = rooms[roomCode];
                let index = room.findIndex(user => user.socketId === socket.id);
                if (index !== -1) {
                    room[index].progress = data.progress;
                    room.sort((a, b) => b.progress - a.progress);
                    io.to(roomCode).emit('roomScore-update', {
                        message: `${room[index].username} current progress ${data.progress}`,
                        users: room, // Send the updated list of users
                    });
                    break;
                }
            }

        })
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
        socket.on('start-game', async (roomCode) => {
            const room = rooms[roomCode];
            const host = room?.find(u => u.isHost);
            if (host?.socketId === socket.id) {
                const data = await fs.readFile('./paragraph.json', 'utf-8');
                const para = JSON.parse(data);
                const ind = Math.floor(Math.random() * (para.length));

                io.to(roomCode).emit('game-start', {
                    par: para[ind].text,
                    time: 10000
                });
                if (!timer[roomCode]) {
                    timer[roomCode] = setTimeout(() => {
                        io.to(roomCode).emit('game-stop', room);
                        clearTimeout(timer[roomCode]);
                        timer[roomCode] = null;
                    }, 10000);
                }
            } else {
                socket.emit('error-message', 'Only the host can start the game.');
            }
        });
    });
}
export default socketConnec;