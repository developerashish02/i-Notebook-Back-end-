const express = require("express");
const router = express.Router();
const fetchuser = require("../middlewares/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

/* ROUTE:1 get all the user notes using : GET "/api/Notes/getuser" Login requreid */
router.get("/fetchallnotes", fetchuser, async (req, res) => {
	try {
		const notes = await Note.find({ user: req.user.id });
		res.json(notes);
	} catch (error) {
		console.error(error.message);
		res.send(500).send("internal Server Error");
	}
});

/* ROUTE:2 add a new notes using : POST "/api/Notes/addnote" Login requreid */
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

/* ROUTE:3 update notes using : PUT "/api/Notes/updatenote" Login requreid */

router.put(
	"/updatenote/:id",
	fetchuser,
	[
		body("title", "Enter a valid title").isLength({ min: 3 }),
		body("description", "Description must be 5 character").isLength({ min: 5 }),
	],
	async (req, res) => {
		try {
			const { title, description, tag } = req.body;
			// create a newNote object
			const newNote = {};
			if (title) {
				newNote.title = title;
			}
			if (description) {
				newNote.description = description;
			}
			if (tag) {
				newNote.tag = tag;
			}

			// find the note to be updated and update
			let note = await Note.findById(req.params.id);
			if (!note) {
				return res.status(404).send("Not found");
			}

			if (note.user.toString() !== req.user.id) {
				return res.status(401).send("Not Allowed");
			}

			note = await Note.findByIdAndUpdate(
				req.params.id,
				{ $set: newNote },
				{ new: true }
			);
			res.json(note);
		} catch (error) {
			console.error(error.message);
			res.send(500).send("internal Server Error");
		}
	}
);

/* ROUTE:4 delete notes using : DELETE "/api/Notes/deletenote" Login requreid */

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
	try {
		// find the note to be delete and deleted
		let note = await Note.findById(req.params.id);
		if (!note) {
			return res.status(404).send("Not found");
		}

		// Allow deletion only if  user owns this note
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not Allowed");
		}

		note = await Note.findByIdAndDelete(req.params.id);
		res.json({ success: "Note has been deleted" });
	} catch (error) {
		console.error(error.message);
		res.send(500).send("internal Server Error");
	}
});

module.exports = router;
