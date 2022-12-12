const usersRouter = require("express").Router();

const UsersController = require("../controllers/UsersController");
const usersController = new UsersController;

usersRouter.post("/", usersController.create);
usersRouter.put("/:id", usersController.update);

module.exports = usersRouter;