const notesRouter = require("express").Router();

const NotesController = require("../controllers/NotesController");
const notesController = new NotesController();

notesRouter.get("/", notesController.index);
notesRouter.get("/:id", notesController.show);
notesRouter.post("/", notesController.create);
notesRouter.delete("/:id", notesController.delete);

module.exports = notesRouter;