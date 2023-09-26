import express from "express";
import mongoose from "mongoose";
import MainRouter from "./routes/MainRouter.js";
import limiter from "./utils/middleware/limitter.js";
import bodyParser from "body-parser"
import cors from "cors"
import dotenv from "dotenv";
import http from "http"
import socket from "./utils/Socket/socket.js";

dotenv.config();

const app = express();
app.use(cors({origin: "*"}))
app.use(express.json());
app.use(MainRouter);
app.use(limiter);
app.use(bodyParser.json({limiter: '5mb'}))

const server = http.createServer(app);
socket(server);


mongoose.connect(process.env.MONGOOSE_CONNECT_URI)
    .then(() => console.log('MongoDB has connected'))
    .catch(error => console.log(error));


server.listen(process.env.PORT || 8000, () => {
    console.log("Server listening as " + process.env.PORT );
})