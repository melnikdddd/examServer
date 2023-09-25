import express from "express";
import mongoose from "mongoose";
import MainRouter from "./routes/MainRouter.js";
import dotenv from "dotenv";
import limiter from "./utils/middleware/limitter.js";
import bodyParser from "body-parser"
import cors from "cors"
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


const PORT = +process.env.PORT;


mongoose
    .connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.fvidml8.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => console.log('MongoDB has connected'))
    .catch(error => console.log(error));


server.listen(PORT, () => {
    console.log("Server listening as localhost:" + PORT);
})