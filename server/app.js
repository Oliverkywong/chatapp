import express from "express";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import './db/connection.js'
import Users from "./models/Users.js"
import Conversation from "./models/Conversation.js"
import Messages from "./models/Messages.js"

// import { Server } from "socket.io";
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const io = require('socket.io')(8080, {
    cors: {
        origin: 'http://localhost:3000'
    }
})

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

const port = process.env.PORT || 8000
// const server = createServer(app);
// const io = new Server(server);

let users = []
io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId)
        if (!isUserExist) {
            const user = { userId, socketId: socket.id }
            users.push(user)
            io.emit('getUsers', users)
        }
    })

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId)
        const sender = users.find(user => user.userId === senderId)
        const user = await Users.findById(senderId)
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            })
        } else {
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            })
        }
    })

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id)
        io.emit('getUsers', users)
    })
});

app.get('/', (req, res) => {
    res.send('welcome')
})

app.post('/api/register', async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body
        console.log({ fullName, email, password })
        if (!fullName || !email || !password) {
            res.status(400).send('fill all required')
        } else {
            const isAlreadyExist = await Users.findOne({ email })
            if (isAlreadyExist) {
                res.status(400).send('Already Exist')
            } else {
                const newUser = new Users({ fullName, email })
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    newUser.set('password', hashedPassword)
                    newUser.save()
                    next()
                });
                return res.status(200).send('user reg success')
            }
        }
    } catch (e) {
        console.log('error', e)
    }
})

app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body
        console.log({ email, password })
        if (!email || !password) {
            res.status(400).send('fill all required')
        } else {
            const user = await Users.findOne({ email })
            if (!user) {
                res.status(400).send('incorrect email')
            } else {
                const validateUser = await bcrypt.compare(password, user.password);
                if (!validateUser) {
                    res.status(400).send('incorrect password')
                } else {
                    const payload = { userId: user.id, email: user.email }
                    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'JWT_SECRET_KEY'
                    jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
                        await Users.updateOne({ _id: user._id }, { $set: { token } })
                        user.save()
                        return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token: token })
                    })
                }
            }
        }
    } catch (e) {
        console.log('error', e)
    }
})

app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body
        const newConversation = new Conversation({ members: [senderId, receiverId] })
        await newConversation.save()
        res.status(200).send('newConversation create success')
    } catch (e) {
        console.log('error', e)
    }
})

app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const conversations = await Conversation.find({ members: { $in: [userId] } })
        const conversationUserData = Promise.all(conversations.map(async conversation => {
            const receiverId = conversation.members.find((member => member !== userId))
            const user = await Users.findById(receiverId)
            return { user: { receiverId: user._id, email: user.email, fullName: user.fullName }, conversationId: conversation._id }
        }))

        res.status(200).json(await conversationUserData)
    } catch (e) {
        console.log('error', e)
    }
})

app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body
        if (!senderId || !message) return res.status(400).send("plz type message")
        if (conversationId === 'new' && receiverId) {
            const newConversation = new Conversation({ members: [senderId, receiverId] })
            await newConversation.save()
            const newMessage = new Messages({ conversationId: newConversation._id, senderId, message })
            await newMessage.save()
            res.status(200).send('newmessage sent success')
        } else if (!conversationId && !receiverId) {
            return res.status(400).send("plz type message")
        }
        const newMessage = new Messages({ conversationId, senderId, message })
        await newMessage.save()
        res.status(200).send('newmessage sent success')
    } catch (e) {
        console.log('error', e)
    }
})

app.get('/api/message/:conversationId', async (req, res) => {
    try {
        let checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId })
            const messagesUserData = Promise.all(messages.map(async message => {
                const user = await Users.findById(message.senderId)
                return { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message }
            }))
            res.status(200).json(await messagesUserData)
        }
        const conversationId = req.params.conversationId
        if (conversationId == 'new') {
            const checkConversation = await Conversation.find({ members: { $all: [req.query.senderId, req.query.receiverId] } })
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id)
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId)
        }
    } catch (e) {
        console.log('error', e)
    }
})

app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const users = await Users.find({ _id: { $ne: userId } })
        const usersdata = Promise.all(users.map(user => {
            return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } }
        }))

        res.status(200).json(await usersdata)
    } catch (e) {
        console.log('error', e)
    }
})

app.listen(port, () => {
    console.log(`listtening on port ${port}`)
})

