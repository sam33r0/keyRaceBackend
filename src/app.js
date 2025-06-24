import express from 'express';
import cors from 'cors'
import userRoute from './routes/user.routes.js'
import scoreRoute from './routes/score.routes.js'
import cookieParser from 'cookie-parser'
import fs from 'fs/promises';

const app = express();
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(express.json({ limit: "32kb" }))
app.use(express.urlencoded({ extended: true, limit: "32kb" }))
app.use(express.static("public"))
app.use(cookieParser());
app.get('/', (req, res) => {
    res.json({ "message": "It is live" })
});

app.get('/api/v1/paragraph', async (req, res) => {
    const data = await fs.readFile('./paragraph.json', 'utf-8');
    const para = JSON.parse(data);
    const ind = Math.floor(Math.random() * (para.length));
    // console.log(para,ind); // Your actual JSON content
    res.status(200).json({
        par: para[ind].text
    })
})
app.use('/api/v1/user', userRoute);
app.use('/api/v1/score', scoreRoute)
export { app };