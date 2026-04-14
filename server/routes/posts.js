import express from "express";
import {getFeedPosts, getUserPosts, likePost, commentPost} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import { postLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

//READ opns.
router.get("/",verifyToken,getFeedPosts);
router.get("/:userId/",verifyToken,getUserPosts);

//UPDATE opns.
router.patch("/:id/like", verifyToken, likePost);
router.post("/:id/comment", verifyToken, postLimiter, commentPost);

export default router;
