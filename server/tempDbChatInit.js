import db from "./dbConnect.js";

async function createMessagesTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages(
                _id serial primary key,
                sender_id INTEGER REFERENCES users(_id) NOT NULL,
                receiver_id INTEGER REFERENCES users(_id) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Messages table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        // Need to wait slightly for clients to finish before exiting process
        setTimeout(() => process.exit(0), 500);
    }
}

createMessagesTable();
