import db from "../dbConnect.js";

export const getMessages = async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        
        const result = await db.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [userId, friendId]
        );
        
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        
        const result = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, content) 
             VALUES ($1, $2, $3) RETURNING *`,
            [senderId, receiverId, content]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
