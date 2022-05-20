const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

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
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		// if there are error return bad request and errors
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		// check whether the user with the same email
		let user = await User.create({
			name: req.body.name,
			password: req.body.password,
			email: req.body.email,
		});
	}
);

module.exports = router;
