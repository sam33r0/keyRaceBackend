import 'dotenv/config'
import { app } from './app.js';
import connectDB from './db/index.js';

connectDB().then(() => {

    app.on("error",
        (error) => {
            console.log("error", error);
            throw error;
        }
    )
    app.listen(process.env.PORT, () => {
        console.log('server listenins on ', process.env.PORT);

    })
}).catch((err) => {
    console.error(err, 'unable to connect db')
})