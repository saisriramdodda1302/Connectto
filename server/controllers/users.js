import db from "../dbConnect.js";

//Read Operation
export const getUser = async(req,res) =>{

    try{

        // console.log(req.params);
        const id = parseInt(req.params.id);

        const result = await db.query("SELECT * from users WHERE _id=$1",[id]);
        const user = result.rows[0];
        res.status(200).json(user);

    }
    catch(err){

        console.log(err);
        res.status(404).json({message: err.message});
    }
}

export const getUserFriends = async(req,res)=>{
    console.log(req.params);
    

    try{
        const {id} = req.params;
        const result = await db.query("SELECT users._id,firstname,lastname,email,picturepath,location,occupation FROM friends JOIN users ON friends.userid = users._id WHERE friends._id = $1  ; ",[id]);
        const formattedFriends = result.rows;

        console.log(formattedFriends);
        res.status(200).json(formattedFriends);
    }
    catch(err){
        res.status(404).json({message: err.message});
    }

}

// Search users by name/email, or (with no search term) list other accounts to
// discover. Self is always excluded.
export const getUsers = async (req, res) => {
    try {
        const currentId = req.user?.id || 0;
        const search = (req.query.search || "").trim();

        let result;
        if (search) {
            const term = `%${search}%`;
            result = await db.query(
                `SELECT _id, firstname, lastname, email, picturepath, location, occupation
                 FROM users
                 WHERE _id <> $1
                   AND (firstname ILIKE $2 OR lastname ILIKE $2 OR email ILIKE $2
                        OR (firstname || ' ' || lastname) ILIKE $2)
                 ORDER BY firstname ASC
                 LIMIT 20`,
                [currentId, term]
            );
        } else {
            result = await db.query(
                `SELECT _id, firstname, lastname, email, picturepath, location, occupation
                 FROM users
                 WHERE _id <> $1
                 ORDER BY _id DESC
                 LIMIT 10`,
                [currentId]
            );
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("getUsers failed:", err);
        res.status(500).json({ message: "Could not load users." });
    }
};

export const addRemoveFriend = async (req,res)=>{
    try{
        const {id,friendId} = req.params;
        const result = await db.query("SELECT * FROM friends WHERE _id=$1 AND userid=$2",[id,friendId]);

        if(result.rows.length==1){
            try{
                await db.query("DELETE FROM friends where _id =$1 and userid = $2",[id,friendId]);
            }
            catch(err){
                return res.status(500).json({message:err.message});
            }
        }
        else{
            try{
                await db.query("INSERT INTO friends VALUES($1,$2)",[id,friendId]);
            }
            catch(err){
                return res.status(500).json({message:err.message});
            }
        }
        try{
            const result2 = await db.query("SELECT users._id,firstname,lastname,email,picturepath,location,occupation FROM friends JOIN users ON friends.userid = users._id WHERE friends._id = $1  ; ",[id]);
            const formattedFriends = result2.rows;

            res.status(200).json(formattedFriends);
        }
        catch(err){
            console.log(err);
        }
        


    }
    catch(err){
        res.status(404).json({message:err.message});
    }
}