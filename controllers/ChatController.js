import ChatModel from "../models/ChatModel.js";


class ChatController {
    getMessages = async (req, res) => {
        try {
            const {chatId} = req.params;

            const messages = await ChatModel.findOne({_id: chatId});
            return messages ? res.status(200).json({success: false, messages: messages})
                : res.status(404).json({success: false, message: "Chat does`not exists."})
        } catch (e) {
            console.log(e);
            return res.status(500).json({success: false, message: "Server error"});
        }

    }
}

export const createChat = async (message) => {
    const chat = await new ChatModel({messages: [message]});
    await chat.save();
    return chat;
}
export const updateMessages = async (chatId, message) => {
    const chat = await ChatModel.findOne({_id: chatId});
    chat.messages.push(message);
    await chat.save();
    return chat;
}



export default new ChatController;