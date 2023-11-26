const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userModel = require('./models/users')
const login_history = require('./models/login_history')
const cors = require('cors')
const body_parser = require('body-parser')
const jwt = require('jsonwebtoken')
const requestIp = require('request-ip');
const moment = require('moment')
const { middleware } = require('./middleware/authMiddleware')
const path = require('path')

const mode = 'pro'

app.use(cors({
    origin: '*'
}))
app.use(body_parser.json())
app.use(requestIp.mw())

app.use(express.static(path.join(__dirname, "./client/dist")));

if (mode === 'pro') {
    app.use(express.static(path.join(__dirname, "./client/dist")));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "./", "client", "dist", "index.html"))
    })
}


app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body
    const ip = req.clientIp;
    try {
        const getUser = await userModel.findOne({ email })
        if (getUser) {
            return res.status(404).json({ message: 'Email already exit' })
        } else {
            const user = await userModel.create({
                name,
                email,
                password
            })
            await login_history.create({
                user_id: user.id,
                ip,
                time: moment().format('LLLL'),
                device: req.headers['user-agent']
            })

            const token = await jwt.sign({
                name: user.name,
                _id: user.id
            }, 'asdasdasd', {
                expiresIn: '2d'
            })

            return res.status(201).json({ token, message: 'Register success' })
        }

    } catch (error) {
        console.log(error)
    }
})

app.post('/api/login', async (req, res) => {
    const { email, password, name } = req.body
    const ip = req.clientIp;
    try {
        const user = await userModel.findOne({ email })
        if (user) {
            if (password === user.password) {

                const token = await jwt.sign({
                    name: user.name,
                    _id: user.id
                }, 'asdasdasd', {
                    expiresIn: '2d'
                })

                const device = await login_history.findOne({
                    $and: [
                        {
                            user_id: {
                                $eq: new mongoose.mongo.ObjectId(user.id)
                            }
                        },
                        {
                            device: {
                                $eq: req.headers['user-agent']
                            }
                        }
                    ]
                })
                if (device) {
                    await login_history.findByIdAndUpdate(device.id, {
                        ip,
                        time: moment().format('LLLL'),
                    })
                } else {
                    await login_history.create({
                        user_id: user.id,
                        ip,
                        time: moment().format('LLLL'),
                        device: req.headers['user-agent']
                    })
                }

                return res.status(201).json({ token, message: 'Register success' })
            } else {
                return res.status(404).json({ message: 'Invalid password' })
            }
        } else {
            return res.status(404).json({ message: 'User not found' })
        }
    } catch (error) {

    }
})

app.use('/api/login/history', middleware, async (req, res) => {

    const { _id } = req.userInfo
    console.log(_id)
    try {
        const login_historys = await login_history.find({ user_id: _id })

        return res.status(200).json({ login_historys })

    } catch (error) {
        console.log(error)
    }
})


const db = async () => {
    try {
        if (mode === 'dev') {
            await mongoose.connect('mongodb://127.0.0.1:27017/authentication')
            console.log('local database connect...')
        } else {
            await mongoose.connect('mongodb+srv://eco:X9fF1JardksEWO9y@cluster0.rbeyhah.mongodb.net/authentication')
            console.log('production database connect...')
        }

    } catch (error) {
        console.log('database connect failed')
    }
}

db()

app.listen(5000, () => console.log(`server is listening on port 5000!`))