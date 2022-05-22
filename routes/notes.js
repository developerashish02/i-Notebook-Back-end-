const express = require("express");
const router = express.Router();
const fetchuser = require("../middlewares/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

/* ROUTE:1 get all the user notes using : GET "/api/auth/getuser" Login requreid */
router.get("/fetchallnotes", fetchuser, async (req, res) => {
	try {
		const notes = await Note.find({ user: req.user.id });
		res.json(notes);
	} catch (error) {
		console.error(error.message);
		res.send(500).send("internal Server Error");
	}
});

/* ROUTE:2 add a new notes using : POST "/api/auth/addnote" Login requreid */
router.post(
	"/addnote",
	fetchuser,
	[
		body("title", "Enter a valid title").isLength({ min: 3 }),
		body("description", "Description must be 5 character").isLength({ min: 5 }),
	],
	async (req, res) => {
		try {
			const { title, description, tag } = req.body;
			// if there are error return bad request and errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			// create a new note
			const note = new Note({
				title,
				description,
				tag,
				user: req.user.id,
			});
			// save note
			const saveNote = await note.save();
			res.send(saveNote);
		} catch (error) {
			console.error(error.message);
			res.send(500).send("internal Server Error");
		}
	}
);

module.exports = router;
