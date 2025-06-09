import express from "express";
import {getFeedPosts, getUserPosts, likePost} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//READ OPERATIONS
router.get("/",verifyToken,getFeedPosts);
router.get("/:userId/",verifyToken,getUserPosts);

//UPDATE OPERATIONS
router.patch("/:id/like",verifyToken,likePost);

export default router;
