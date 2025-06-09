import express from "express";
import bodyParser from "body-parser";
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


/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));

app.use(bodyParser.json({limit:"30mb", extended: true})); //makes the maximum limit to send as 30mb
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}));//makes the maximum limit to send a 30

app.use(cors());
app.use("/assets",express.static(path.join(__dirname, 'public/assets')));//In a real system, you need to store this locally

//File Storage
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"public/assets");
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage});//this helps in the uploading part

const port = process.env.PORT;

//here upload is used a middleware which uploads the picture
app.post("/auth/register",upload.single("picture"),register);
app.post("/posts",verifyToken,upload.single("picture"),createPost);

//Routes
app.use("/auth",authRoutes);
app.use("/users",userRoutes);
app.use("/posts",postsRoutes);


app.listen(port,()=>{
	console.log(`server running on port ${port}`); 
});
