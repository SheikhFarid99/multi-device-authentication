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
const middleware = require('./middleware/authMiddleware')
const path = require('path')
const cookie_parser = require('cookie-parser')
const os = require('os');
const DeviceDetector = require('node-device-detector');
const DeviceHelper = require('node-device-detector/helper');

const mode = 'pro'


app.use(cors({
    origin: mode !== 'dev' ? '*' : 'http://localhost:5173',
    credentials: true
}))
app.use(body_parser.json())
app.use(cookie_parser());
app.use(requestIp.mw())


const get_device_info = (user_agent) => {

    const detector = new DeviceDetector({
        clientIndexes: true,
        deviceIndexes: true,
        deviceAliasCode: false,
        parseUserAgent: true
    });
    const obj = {

    }
    const result = detector.detect(user_agent);

    if (DeviceHelper.isDesktop(result)) {
        obj.os = result.os.name
        obj.model = result.device.model ? result.device.model : ''
        obj.browser = result.client.name
    } else {
        obj.os = result.os.name
        obj.model = result.device.model ? result.device.model : 'unknown'
        obj.browser = result.client.name
    }

    return obj
}

// { "os": { "name": "Android", "short_name": "AND", "version": "10", "platform": "", "family": "Android" }, "client": { "type": "browser", "name": "Chrome Mobile", "short_name": "CM", "version": "119.0.0.0", "engine": "Blink", "engine_version": "119.0.0.0", "family": "Chrome" }, "device": { "id": "", "type": "smartphone", "brand": "", "model": "" } }

// {"os":{"name":"Android","short_name":"AND","version":"10","platform":"","family":"Android"},"client":{"name":"Facebook","type":"mobile app","version":"435.0.0.32.108"},"device":{"id":"XI","type":"smartphone","brand":"Xiaomi","model":"Redmi 9"}}

// {"os":{"name":"Windows","short_name":"WIN","version":"10","platform":"x64","family":"Windows"},"client":{"type":"browser","name":"Chrome","short_name":"CH","version":"119.0.0.0","engine":"Blink","engine_version":"119.0.0.0","family":"Chrome"},"device":{"id":"","type":"desktop","brand":"","model":""}}

//DeviceHelper.isMobile(result);
//DeviceHelper.isDesktop(result);
//DeviceHelper.isTablet(result);
//DeviceHelper.isSmartphone(result);

app.post('/api/register', async (req, res) => {

    const { email, password, name } = req.body
    const ip = req.clientIp;
    const device_info = get_device_info(req.headers['user-agent'])
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
            const uniqueToken = Date.now()

            await login_history.create({
                user_id: user.id,
                ip,
                time: uniqueToken,
                user_agent: req.headers['user-agent'],
                token: uniqueToken,
                device_info: device_info
            })

            const token = await jwt.sign({
                name: user.name,
                _id: user.id
            }, 'asdasdasd', {
                expiresIn: '2d'
            })

            res.cookie('user_token', uniqueToken, { expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) })
            return res.status(201).json({ token, message: 'Register success' })
        }

    } catch (error) {
        console.log(error)
    }
})

app.post('/api/login', middleware.cookie_check, async (req, res) => {

    const { email, password } = req.body
    const ip = req.clientIp;
    const device_info = get_device_info(req.headers['user-agent'])
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

                if (req.cookie_token) {

                    const device = await login_history.findOne({
                        $and: [
                            {
                                user_id: {
                                    $eq: new mongoose.mongo.ObjectId(user.id)
                                }
                            },
                            {
                                user_agent: {
                                    $eq: req.headers['user-agent']
                                }
                            }, {
                                token: {
                                    $eq: req.cookie_token
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
                        const uniqueToken = Date.now()
                        await login_history.create({
                            user_id: user.id,
                            ip,
                            time: uniqueToken,
                            user_agent: req.headers['user-agent'],
                            token: uniqueToken,
                            device_info: device_info
                        })
                        res.cookie('user_token', uniqueToken, { expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) })
                    }

                } else {
                    const uniqueToken = Date.now()
                    await login_history.create({
                        user_id: user.id,
                        ip,
                        device_info: device_info,
                        time: uniqueToken,
                        user_agent: req.headers['user-agent'],
                        token: uniqueToken
                    })
                    res.cookie('user_token', uniqueToken, { expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) })
                }

                return res.status(201).json({ token, message: 'Register success' })
            } else {
                return res.status(404).json({ message: 'Invalid password' })
            }
        } else {
            return res.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        console.log(error.message)
    }
})

app.use('/api/login/history', middleware.cookie_check, middleware.auth, async (req, res) => {

    const { _id } = req.userInfo

    try {
        const login_historys = await login_history.find({ user_id: _id }).sort({ createdAt: -1 })

        return res.status(200).json({ login_historys })

    } catch (error) {
        console.log(error)
    }
})


app.use('/api/anather/user/logout/:id', middleware.cookie_check, middleware.auth, async (req, res) => {
    const { id } = req.params
    try {
        await login_history.findByIdAndDelete(id)
        return res.status(200).json({ message: 'logout success' })
    } catch (error) {

    }
})


if (mode === 'pro') {
    app.use(express.static(path.join(__dirname, "./client/dist")));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "./", "client", "dist", "index.html"))
    })
}


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


