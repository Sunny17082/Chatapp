const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const ws = require("ws");
const app = express();

const PORT = process.env.PORT;

const jwtSecret = process.env.SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);

app.use(express.json());

app.use(cookieParser());

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("Connection successful..."))
	.catch((err) => console.log(err));

app.get("/profile", async (req, res) => {
	const token = req.cookies?.token;
	if (token) {
		jwt.verify(token, jwtSecret, {}, (err, userData) => {
			// if (err) throw err;
			res.json(userData);
		});
	} else {
		res.status(401).json("no token");
	}
});

app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const foundUser = await User.findOne({ username });
		if (foundUser) {
			const correctPassword = bcrypt.compareSync(
				password,
				foundUser.password
			);
			if (correctPassword) {
				jwt.sign(
					{ userId: foundUser._id, username },
					jwtSecret,
					{},
					(err, token) => {
						if (err) throw err;
						res.cookie("token", token).status(201).json({
							id: foundUser._id,
							username,
						});
					}
				);
			} else {
				res.json({ msg: "Wrong password!", status: false });
			}
		} else {
			res.json({ msg: "User not found!", status: false });
		}
	} catch (err) {
		res.status(500).json(err);
	}
});

app.post("/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const usernameCheck = await User.findOne({ username });
		if (usernameCheck)
			return res.json({ msg: "Username already exist", status: false });
		const emailCheck = await User.findOne({ email });
		if (emailCheck) {
			return res.json({ msg: "Email already exist", status: false });
		}
		const userDoc = await User.create({
			username,
			email,
			password: bcrypt.hashSync(password, bcryptSalt),
		});
		jwt.sign(
			{ userId: userDoc._id, username },
			jwtSecret,
			{},
			(err, token) => {
				if (err) throw err;
				res.cookie("token", token).status(201).json({
					id: userDoc._id,
					username,
				});
			}
		);
	} catch (err) {
		res.status(500).json("error");
	}
});

const server = app.listen(PORT, () => {
	console.log(`Server started on Port ${PORT}...`);
});

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
	const cookies = req.headers.cookie;
	if (cookies) {
		const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
		if (tokenCookieString) {
			const token = tokenCookieString.split('=')[1];
			if (token) {
				jwt.verify(token, jwtSecret, {}, (err, userData) => {
					if (err) throw err;
					const {userId, username} = userData;
					connection.userId = userId;
					connection.username = username;
				});
			}
		}
	}
});