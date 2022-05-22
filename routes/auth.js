const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "ashishGood$boy";
const fetchuser = require("../middlewares/fetchuser");

/* ROTE 1: 1create a user using :POST "/api/auth/createuser".Doest required auth */
router.post(
	"/createuser",
	[
		body("name", "Enter a valid name").isLength({ min: 3 }),
		body("email", "Enter a valid email").isEmail(),
		body("password", "password must be atleast 5 character").isLength({
			min: 5,
		}),
	],
	async (req, res) => {
		// if there are error return bad request and errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		// check whether the user with the same email
		try {
			let user = await User.findOne({ email: req.body.email });
			if (user) {
				return res
					.status(400)
					.json({ error: "email is alredy register pls enter unique email" });
			}

			// password bcrypt
			const salt = await bcrypt.genSalt(10);
			const secPass = await bcrypt.hash(req.body.password, salt);
			user = await User.create({
				name: req.body.name,
				password: secPass,
				email: req.body.email,
			});

			// jwt signature
			const data = {
				user: {
					id: user.id,
				},
			};

			// get auth token
			const authToken = jwt.sign(data, JWT_SECRET);
			res.json({ authToken });
		} catch (error) {
			console.error(error.message);
			res.send(500).send("internal Server Error");
		}
	}
);

/* ROUTE:2 authenticaion a user using: POST"api/auth/login. no login requried" */
router.post(
	"/login",
	[
		body("email", "Enter a valid email").isEmail(),
		body("password", "password cannot be blank ").exists(),
	],

	async (req, res) => {
		// if there are error return bad request and errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// get the email and password from the req.body
		const { email, password } = req.body;

		try {
			// getting the user
			let user = await User.findOne({ email });
			// if user not exist throw error
			if (!user) {
				return res
					.status(400)
					.json({ error: "Please try to login with correct credential" });
			}
			// compare password
			const passwordCompare = await bcrypt.compare(password, user.password);
			if (!passwordCompare) {
				return res
					.status(400)
					.json({ error: "Please try to login with correct credential" });
			}
			// correct credential
			const data = {
				user: {
					id: user.id,
				},
			};

			// get auth token
			const authToken = jwt.sign(data, JWT_SECRET);
			res.json({ authToken });
		} catch (error) {
			console.error(error.message);
			res.send(500).send("internal Server Error");
		}
	}
);

/* ROUTE:3 get a loggedin user detail : POST "api/auth/getuser" .login requried" */

router.post("/getuser", fetchuser, async (req, res) => {
	try {
		userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		res.send(user);
	} catch (error) {
		console.error(error.message);
		res.send(500).send("internal Server Error");
	}
});

module.exports = router; 