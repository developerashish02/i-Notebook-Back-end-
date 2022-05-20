const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// create a user using :POST "/api/auth/".Doest required auth
router.post(
	"/",
	[
		body("name", "Enter a valid name").isLength({ min: 3 }),
		body("email", "Enter a valid email").isEmail(),
		body("password", "password must be atleast 5 character").isLength({
			min: 5,
		}),
	],
	(req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		User.create({
			name: req.body.name,
			password: req.body.password,
			email: req.body.email,
		})
			.then((user) => res.json(user))
			.catch((errors) => {
				console.log(errors);
				res.json({
					error: "Email is alredy register ",
					message: errors.message,
				});
			});
	}
);

module.exports = router;
