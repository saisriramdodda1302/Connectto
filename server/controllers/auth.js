import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../dbConnect.js";

export const register = async (req,res)=>{

    const {firstName,
        lastName,
        email,
        location,
        occupation,
        picturePath,
        password
    } = req.body;

    try{
        //hash the password
        const salt = await bcrypt.genSalt();//this generates random salt values
        const hashpassword = await bcrypt.hash(password,salt);
        const viewedProfile = Math.floor(Math.random()*10000);
        const impressions = Math.floor(Math.random()*1000);
        

        await db.query("INSERT INTO users(firstName, lastName, email, password, picturePath, location, occupation, viewedProfile, impressions) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [firstName,lastName,email,hashpassword,picturePath,location,occupation,viewedProfile,impressions]);

        const user = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            location: location,
            occupation: occupation,
            picturePath: picturePath,
            viewedProfile: viewedProfile,
            impressions: impressions,
        }

        console.log(user);

        res.status(201).json(user);

    }
    catch(err){
        res.status(500).json({error: err.message});
    }
    
}

//Login
export const login = async (req,res)=>{
    // console.log(req.body);
    try{

        const {email,password} = req.body;
        const result = await db.query("SELECT * FROM users WHERE email = $1",[email]);

        if(result.rows.length!=1) return res.status(400).json({msg: "User doesn't exist"});
        
        const isMatch = await bcrypt.compare(password,result.rows[0].password);
        if(!isMatch) return res.status(200).json({msg: "Invalid Credentials"});

        const user = result.rows[0];
        user.password="";

        //using JWT Token

        const token = jwt.sign({id:result.rows[0]._id},process.env.JWT_SECRET);
        result.rows[0].password = "";

        res.status(200).json({token,user});


    }
    catch(err){
        res.status(500).json({error: err.message});
    }
}