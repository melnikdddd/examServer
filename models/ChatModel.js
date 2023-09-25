import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }
    ],
})

export default mongoose.model("Chat", chatSchema);

