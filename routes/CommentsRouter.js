import express from "express";
import _checkAuth from "../utils/auth/checkAuth.js";
import CommentController from "../controllers/CommentController.js";
import commentValidator from "../validations/CommentValidator.js";
import multer from "multer";

const upload = multer();
const CommentsRouter = express.Router();

CommentsRouter.use(_checkAuth);

CommentsRouter.post('/:model',commentValidator, upload.array('photos'), CommentController.createComment);

CommentsRouter.route('/:id')
    .patch(commentValidator, upload.array('photos'), CommentController.editComment)
    .delete(CommentController.removeComment);

CommentsRouter.get('/:model/:id', CommentController.getAll);

export default CommentsRouter;