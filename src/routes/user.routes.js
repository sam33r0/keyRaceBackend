import { Router } from "express";
import { googleLogin, login, logoutUser, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/google').get(googleLogin)
export default router