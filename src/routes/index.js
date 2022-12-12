const router = require("express").Router();

const usersRoutes = require("./users.routes");
const notesRoutes = require("./notes.routes");

router.use("/users", usersRoutes);
router.use("/notes", notesRoutes);

module.exports = router;