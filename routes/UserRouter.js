import express from "express";
import _checkAuth from "../utils/auth/checkAuth.js";
import UserController from "../controllers/UserController.js";
import multer from "multer";
import {userValidation} from "../validations/UserValidator.js";
import checkAuth from "../utils/auth/checkAuth.js";
import {_updateUser} from "../utils/middleware/userMiddleware.js";


const upload = multer()
const UserRouter = express.Router();

UserRouter.get("/", UserController.getUsers)

UserRouter.get("/getUserByToken", checkAuth ,UserController.getUserByToken)

UserRouter.get('/:id', UserController.getUser);


UserRouter.route('/:id')
    .patch(_checkAuth, userValidation, _updateUser, upload.single('userAvatar'), UserController.updateUser)
    .delete(_checkAuth ,UserController.removeUser);


UserRouter.post("/:id/chats", checkAuth, UserController.getUsersInChat)

export default UserRouter;