import express from "express";
import * as bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
// import './db/connection'
import Users from "./models/Users.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const port = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.send('welcome')
})

app.post('/api/register', async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body
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
                        next()
                    })
                    return res.status(200).json({user: {email:user.email, fullName:user.fullName}, token:user.token})
                }
            }
        }
    } catch (e) {
        console.log('error', e)
    }
})

app.listen(port, () => {
    console.log(`listtening on port ${port}`)
})

