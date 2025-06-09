import db from "../dbConnect.js";

//Creating a post
export const createPost = async (req,res) =>{
    try{
        const {userId, description, picturepath} = req.body;

        await db.query("INSERT INTO post(userid,description,picturepath) VALUES($1,$2,$3)", [userId,description,picturepath]);

        const result = await db.query("SELECT post._id,post.userid,firstname,lastname,post.description,post.picturepath FROM post JOIN users ON post.userid = users._id");
        const post = result.rows;

        const promises = post.map(async (index,i)=> {
            const postId = index._id;
            try{
                const result = await db.query("SELECT userid FROM likes  WHERE post_id=$1",[postId]);
                // console.log(result.rows);
                return {...index,likes: result.rows};
            }   
            catch(err){
                console.log(err);
            }
        });

        const updatedPost = await Promise.all(promises);


        // console.log("hello");
        // console.log(post);

        res.status(201).json(updatedPost);
    }
    catch(err){
        res.status(409).json({message: err.message});
    }
}

//Read all the posts
export const getFeedPosts  = async(req,res) =>{
    try{
        const result = await db.query("SELECT post._id,post.userid,firstname,lastname,post.description,post.picturepath FROM post JOIN users ON post.userid = users._id");
        const post = result.rows;

        const promises = post.map(async (index,i)=> {
            const postId = index._id;
            try{
                const result = await db.query("SELECT userid FROM likes  WHERE post_id=$1",[postId]);
                // console.log(result.rows);
                return {...index,likes: result.rows};
            }   
            catch(err){
                console.log(err);
            }
        });

        const updatedPost = await Promise.all(promises);


        // console.log("hello");
        // console.log(post);

        res.status(200).json(updatedPost);
    }
    catch(err){
        res.status(404).json({message: err.message});
    }
}

export const getUserPosts = async (req,res) =>{
    try{
        const {userId} = req.params;
        const result = await db.query("SELECT post._id,post.userid,firstname,lastname,post.description,post.picturepath FROM post JOIN users ON post.userid = users._id WHERE post.userid = $1",[userId]);
        const post = result.rows;

        const promises = post.map(async (index,i)=> {
            const postId = index._id;
            try{
                const result2 = await db.query("SELECT userid FROM likes WHERE post_id=$1",[postId]);
                // console.log(result.rows);
                return {...index,likes: result2.rows};
            }   
            catch(err){
                console.log(err);
            }
        });

        const updatedPost = await Promise.all(promises);

        res.status(201).json(updatedPost);
    }
    catch(err){
        console.log(err);
        res.status(409).json({message: err.message});
    }
}

//UPDATE
export const likePost = async (req,res) =>{
    try{

        const {id} = req.params;
        const {userId} = req.body;

        console.log(id,userId);

        //check if it is liked and then return the likes
        const result = await db.query("SELECT * from likes WHERE post_id = $1 AND userid = $2",[id,userId]);

        if(result.rows.length==1){
                await db.query("DELETE FROM likes WHERE post_id = $1 and userid = $2",[id,userId]);

        }
        else{
            await db.query("INSERT INTO likes VALUES($1,$2)",[id,userId]);
        }

        const result2 = await db.query("SELECT post._id,post.userid,firstname,lastname,post.description,post.picturepath FROM post JOIN users ON post.userid = users._id");
        const post = result2.rows;

        // console.log(post);

        const promises = post.map(async (index,i)=> {
            const postId = index._id;
            try{
                const result = await db.query("SELECT userid FROM likes WHERE post_id=$1",[postId]);
                // console.log(result.rows);
                return {...index,likes: result.rows};
            }   
            catch(err){
                console.log(err);
            }
        });

        const updatedPost = await Promise.all(promises);

        // console.log(updatedPost);

        res.status(201).json(updatedPost);
    }
    catch(err){
        console.log(err);
        res.status(409).json({message: err.message});
    }
}
