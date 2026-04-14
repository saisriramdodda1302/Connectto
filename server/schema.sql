-- this script to drop existing tables and recreate new ones.
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS likes CASCADE;
-- DROP TABLE IF EXISTS friends CASCADE;
-- DROP TABLE IF EXISTS post CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    _id SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    picturePath VARCHAR(255),
    location VARCHAR(255),
    occupation VARCHAR(255),
    viewedProfile INT DEFAULT 0,
    impressions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post (
    _id SERIAL PRIMARY KEY,
    userid INT NOT NULL,
    description TEXT,
    picturepath VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(_id) ON DELETE CASCADE
);

CREATE TABLE likes (
    post_id INT NOT NULL,
    userid INT NOT NULL,
    PRIMARY KEY (post_id, userid),
    FOREIGN KEY (post_id) REFERENCES post(_id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(_id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    userid INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post(_id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(_id) ON DELETE CASCADE
);

CREATE TABLE friends (
    _id INT NOT NULL,
    userid INT NOT NULL,
    PRIMARY KEY (_id, userid),
    FOREIGN KEY (_id) REFERENCES users(_id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(_id) ON DELETE CASCADE
);

-- Indexes for Cursor Pagination and Performance
CREATE INDEX idx_post_id ON post(_id DESC);
CREATE INDEX idx_post_userid ON post(userid);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
