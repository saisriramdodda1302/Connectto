import express from "express";
import {
    getUser,
    getUsers,
    getUserFriends,
    addRemoveFriend,
} from "../controllers/users.js";
import {verifyToken} from "../middleware/auth.js";


const router = express.Router();

//All the read Operations

router.get("/",verifyToken,getUsers);
router.get("/:id",verifyToken,getUser);
router.get("/:id/friends",verifyToken,getUserFriends);

//Update Operations
router.patch("/:id/:friendId",verifyToken,addRemoveFriend);

export default router;