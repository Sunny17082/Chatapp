const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;

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

app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
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

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new OAuth2Strategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,  
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
			scope: ["profile", "email"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				var user = await User.findOne({ googleID: profile.id });
				if (!user) {
					user = await User.create({
						googleID: profile.id,
						username: profile.displayName,
						email: profile.emails[0].value,
						image: profile.photos[0].value,
					});
				}
				return done(null, user);
			} catch (err) {
				return done(err, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
	successRedirect: "http://localhost:5173/",
	failureRedirect: "http://localhost:5173/login"
}));

app.get("/login/success", (req, res) => {
	if (req.user) {
		res.status(200).json(req.user);
	} else {
		res.status(500).json("not authorized");
	}
});

app.get("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect("http://localhost:5173/");
	});
});

app.listen(PORT, () => {
	console.log(`Server started on Port ${PORT}...`);
});
