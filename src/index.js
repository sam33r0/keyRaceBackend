import 'dotenv/config'
import { app } from './app.js';
import connectDB from './db/index.js';
import { Server } from "socket.io";
import { createServer } from 'node:http';
import socketConnec from './utils/socketUtil.js';
connectDB().then(() => {

    app.on("error",
        (error) => {
            console.log("error", error);
            throw error;
        }
    )
    const server = createServer(app);
    const io = new Server(server, {
        cors: {
            origin: true,
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    server.listen(process.env.PORT, () => {
        console.log('server listenins on ', process.env.PORT);

    })
    socketConnec(io);


}).catch((err) => {
    console.error(err, 'unable to connect db')
})