import {Server} from "socket.io";
import {readChat, setOffline, setOnline, updateChatsInfo} from "../../controllers/UserController.js";
import {createChat, updateMessages} from "../../controllers/ChatController.js";


const socket = (server) => {

    const onlineUsers = new Map;

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    })

    io.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
    io.on("connection", socket => {
        socket.on("userLoggedIn", async (user) => {
            socket.currentUser = user;
            onlineUsers.set(user._id, socket.id);
            await setOnline(user._id);


        });
        socket.on("disconnect", async () => {
            const currentId = socket?.currentUser?._id || null;
            if (!currentId){
                return;
            }
            await setOffline(currentId);
            onlineUsers.delete(currentId);
        });
        socket.on("sendMessage", async (data) => {
            const {chatId, user, message} = data;
            const ownId = socket.currentUser._id;

            if (ownId === user._id){
                socket.emit("newMessage", {success: false});
                return;
            }


            //обновляем базу данных сообщений
            const chat = chatId ?
                await updateMessages(chatId, message) : await createChat(message);

            data.chatId = chat._id;


            await updateBoth(ownId, data);
            //отправялем сообщение второму пользователю

            socket.emit("newMessage", data);

            const userSocket = onlineUsers.get(user._id);
            console.log("ownId: " +  ownId, +", anyUserId: " + user._id);


            if (userSocket) {
                console.log("any user get message");
                data.user = socket.currentUser;
                io.to(userSocket).emit("newMessage", data);
            }
        })

        socket.on("readChat", async (data) => {
            await readChat(data)
        })
    })

}

const updateBoth = async (currentUserId, data) => {
    const {chatId, user, message} = data;
    const userId = user._id;

    await updateChatsInfo(currentUserId, {chatId, userId, message, read: true});
    await updateChatsInfo(userId, {chatId, userId: currentUserId, message});

}

export default socket;