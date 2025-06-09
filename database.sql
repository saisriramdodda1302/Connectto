-- creating users database --
CREATE TABLE users(
	_id serial primary key,
	firstName varchar(50) NOT NULL,
	lastName varchar(50) NOT NULL,
	
	email varchar(250) NOT NULL UNIQUE,
	password varchar(250) NOT NULL,
	
	picturePath varchar(500),
	location varchar(500),
	occupation varchar(250),
	viewedProfile int,
	impressions int
);

--INSERTING SOME DATA--
INSERT INTO users(firstname,lastname,email,password,picturepath,location,occupation,viewedprofile,impressions) 
VALUES('karthik','mohan','test123mo@gmail.com','kart','samosa','samosa','samosa',10,10);

-- creating friends database --
CREATE TABLE friends(
	_id serial primary key,
	userid INTEGER REFERENCES users(_id) NOT NULL, 
);

-- GETTING FRIENDS --
SELECT users._id,firstname,lastname,email,picturepath,location,occupation,viewedprofile,impressions FROM friends 
JOIN users ON friends.userid = users._id
WHERE friends._id = 1; 

--SELECTING FRIENDS -- 
SELECT * FROM friends WHERE _id = 1 AND userid = 2;
--DELETING FRIENDS --
DELETE FROM friends WHERE _id = 1 AND userid = 2;

--creating post database--
CREATE TABLE post(
	_id serial primary key,
	userid INTEGER REFERENCES users(_id) NOT NULL, 
	firstName varchar(50) NOT NULL,
	lastName varchar(50) NOT NULL,
	
	location varchar(500),
	description varchar(250),
	
	userPicturePath varchar(500),
	picturePath varchar(500),
);

--creating likes database
CREATE TABLE likes(
	post_id INTEGER REFERENCES post(_id) NOT NULL ,
	userid INTEGER REFERENCES users(_id) NOT NULL
)

