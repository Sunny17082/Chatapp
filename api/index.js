const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

const PORT = process.env.PORT;

app.use(
	cors({
		credentials: true,
		origin: "http://localhost:5173",
	})
);

mongoose.connect(process.env.MONGO_URI)
	.then(() => console.log("Connection successful..."))
	.catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log(`Server started on Port ${PORT}...`);
});