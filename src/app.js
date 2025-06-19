import express from 'express';
import cors from 'cors'
import userRoute from './routes/user.routes.js'
import cookieParser from 'cookie-parser'
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
app.use('/api/v1/user', userRoute);
export { app };