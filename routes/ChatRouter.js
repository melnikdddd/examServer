import express from "express";
import checkAuth from "../utils/auth/checkAuth.js";
import ChatController from "../controllers/ChatController.js";

const ChatRouter = express.Router();

ChatRouter.get('/:userId/:chatId', checkAuth, ChatController.getMessages);

export default ChatRouter;
