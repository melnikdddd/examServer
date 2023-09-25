import express from "express";
import AuthRouter from "./AuthRouter.js";
import ProductRouter from "./ProductRouter.js";
import UserRouter from "./UserRouter.js";
import EachRouter from "./EachRouter.js";
import CommentsRouter from "./CommentsRouter.js";
import ChatRouter from "./ChatRouter.js";

const MainRouter = express.Router();

MainRouter.use('/auth', AuthRouter);
MainRouter.use('/products', ProductRouter);
MainRouter.use('/users', UserRouter);
MainRouter.use('/comments', CommentsRouter);
MainRouter.use('/chats', ChatRouter)
MainRouter.use(EachRouter);


export default MainRouter;