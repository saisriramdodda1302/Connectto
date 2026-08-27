import express from "express";
import fs from "fs";
import db from "./dbConnect.js";
import cors from "cors";
import env from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import {register} from "./controllers/auth.js";
import {createPost} from "./controllers/posts.js";
import {verifyToken} from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postsRoutes from "./routes/posts.js";
import messageRoutes from "./routes/messages.js";
import http from "http";
import { Server } from "socket.io";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();
const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));

if (!fs.existsSync("public/assets")) {
    fs.mkdirSync("public/assets", { recursive: true });
}

app.use(express.json({limit:"30mb"})); //makes the maximum limit to send as 30mb.
app.use(express.urlencoded({limit:"30mb",extended:true}));//makes the maximum limit to send a 30.

// Known hosts, plus anything in CLIENT_URL (comma-separated).
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://connectto-saisriramdodda1302.vercel.app",
];
const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin(origin, callback) {
    // no Origin header => non-browser client (curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use("/assets",express.static(path.join(__dirname, 'public/assets')));//In a real system, you need to store this locally

//File Storage.
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"public/assets");
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage});//this helps in the uploading part.

const port = process.env.PORT;

//here upload is used a middleware which uploads the picture.
import { authLimiter, postLimiter } from "./middleware/rateLimiter.js";

app.post("/auth/register", authLimiter, upload.single("picture"), register);
app.post("/posts", verifyToken, postLimiter, upload.single("picture"), createPost);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "database unavailable" });
  }
});
//Routes.
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postsRoutes);
app.use("/messages", messageRoutes);

/* SOCKET.IO SETUP */
// Maintain a simple mapping of user ID to socket ID
const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  
  socket.on("addUser", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  });

  socket.on("sendMessage", ({ senderId, receiverId, content, created_at }) => {
    const receiverSocketId = userSocketMap.get(receiverId);
    
    // Create the message object to broadcast
    const incomingMessageMessage = {
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      created_at: created_at || new Date().toISOString()
    };

    if (receiverSocketId) {
      // Send to the active receiver client
      io.to(receiverSocketId).emit("receiveMessage", incomingMessageMessage);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (let [id, sId] of userSocketMap.entries()) {
      if (sId === socket.id) {
        userSocketMap.delete(id);
        console.log(`User ${id} removed from mapping.`);
        break;
      }
    }
  });
});

server.listen(port, () => {
	console.log(`server running on port ${port}`); 
});
