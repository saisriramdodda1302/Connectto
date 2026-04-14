import db from "../dbConnect.js";

// Helper query block to be reused
const postDetailsSelect = `
    SELECT 
        p._id, p.userid, u.firstname, u.lastname, p.description, p.picturepath, u.picturepath as userpicturepath,
        COALESCE(
            (SELECT json_agg(json_build_object('userid', l.userid)) FROM likes l WHERE l.post_id = p._id), 
            '[]'::json
        ) AS likes,
        COALESCE(
            (SELECT json_agg(
                json_build_object('id', c.id, 'userid', c.userid, 'text', c.text, 'created_at', c.created_at, 'firstName', cu.firstName, 'lastName', cu.lastName, 'picturePath', cu.picturePath)
            ) FROM comments c JOIN users cu ON c.userid = cu._id WHERE c.post_id = p._id), 
            '[]'::json
        ) AS comments
    FROM post p
    JOIN users u ON p.userid = u._id
`;

// Creating a post
export const createPost = async (req,res) =>{
    try{
        const {userId, description, picturepath} = req.body;
        const insertRes = await db.query("INSERT INTO post(userid,description,picturepath) VALUES($1,$2,$3) RETURNING _id", [userId,description,picturepath]);
        const postId = insertRes.rows[0]._id;
        
        const result = await db.query(`${postDetailsSelect} WHERE p._id = $1`, [postId]);
        res.status(201).json(result.rows[0]);
    }
    catch(err){
        res.status(409).json({message: err.message});
    }
}

// Read all the posts
export const getFeedPosts  = async(req,res) =>{
    try{
        const cursor = req.query.cursor;
        const limit = parseInt(req.query.limit) || 10;
        
        let query = `${postDetailsSelect} ORDER BY p._id DESC LIMIT $1`;
        let values = [limit];
        
        if (cursor && cursor !== 'null') {
            query = `${postDetailsSelect} WHERE p._id < $1 ORDER BY p._id DESC LIMIT $2`;
            values = [cursor, limit];
        }

        const result = await db.query(query, values);
        const posts = result.rows;
        
        // ensure valid json for empty comments vs null
        const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

        res.status(200).json({ posts, nextCursor });
    }
    catch(err){
        console.error(err);
        res.status(404).json({message: err.message});
    }
}

export const getUserPosts = async (req,res) =>{
    try{
        const {userId} = req.params;
        const cursor = req.query.cursor;
        const limit = parseInt(req.query.limit) || 10;
        
        let query = `${postDetailsSelect} WHERE p.userid = $1 ORDER BY p._id DESC LIMIT $2`;
        let values = [userId, limit];
        
        if (cursor && cursor !== 'null') {
            query = `${postDetailsSelect} WHERE p.userid = $1 AND p._id < $2 ORDER BY p._id DESC LIMIT $3`;
            values = [userId, cursor, limit];
        }

        const result = await db.query(query, values);
        const posts = result.rows;
        const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

        res.status(200).json({ posts, nextCursor });
    }
    catch(err){
        console.log(err);
        res.status(409).json({message: err.message});
    }
}

// UPDATE
export const likePost = async (req,res) =>{
    try{
        const {id} = req.params;
        const {userId} = req.body;

        const result = await db.query("SELECT * from likes WHERE post_id = $1 AND userid = $2",[id,userId]);

        if(result.rows.length==1){
            await db.query("DELETE FROM likes WHERE post_id = $1 and userid = $2",[id,userId]);
        }
        else{
            await db.query("INSERT INTO likes VALUES($1,$2)",[id,userId]);
        }

        const result2 = await db.query(`${postDetailsSelect} WHERE p._id = $1`, [id]);
        res.status(201).json(result2.rows[0]);
    }
    catch(err){
        console.log(err);
        res.status(409).json({message: err.message});
    }
}

// CREATE Comment
export const commentPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, text } = req.body;
        
        await db.query("INSERT INTO comments(post_id, userid, text) VALUES($1, $2, $3)", [id, userId, text]);
        
        const result = await db.query(`${postDetailsSelect} WHERE p._id = $1`, [id]);
        res.status(201).json(result.rows[0]);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}
