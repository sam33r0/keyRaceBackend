import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addScore, getPastHistory } from "../controllers/score.controller.js";

const router = Router();

router.route('/addScore').post(verifyJWT, addScore)
router.route('/pastScore').get(verifyJWT, getPastHistory)
export default router