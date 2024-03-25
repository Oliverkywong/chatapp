import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    conversationId: {
        type: String
    },
    senderId: {
        type: String
    },
    message: {
        type: String
    },
})

const Messages = mongoose.model('Messages', messageSchema)
export default Messages