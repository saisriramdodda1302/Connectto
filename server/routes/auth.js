import express from "express";
import {login} from "../controllers/auth.js";
import {authLimiter} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, login);

export default router;