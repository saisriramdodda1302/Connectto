import express from "express";
import { getMessages, getConversations, sendMessage } from "../controllers/messages.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/threads/:userId", verifyToken, getConversations);
router.get("/:userId/:friendId", verifyToken, getMessages);
router.post("/", verifyToken, sendMessage);

export default router;
