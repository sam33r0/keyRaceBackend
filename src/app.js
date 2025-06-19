import express from 'express';
import cors from 'cors'
const app = express();
app.use(cors({
    origin: true,
    credentials: true
}))
app.get('/', (req, res) => {
    res.json({ "message": "It is live" })
});
export { app };