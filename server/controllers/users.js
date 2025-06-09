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