import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    token: {
        type: String
    },
})

const Users = mongoose.model('User', userSchema)
export default  Users