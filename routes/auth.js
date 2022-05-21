const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "ashishGood$boy";

// create a user using :POST "/api/auth/createuser".Doest required auth
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
		}
	}
);

module.exports = router;
