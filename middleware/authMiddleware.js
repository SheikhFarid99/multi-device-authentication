const jwt = require('jsonwebtoken')
const login_history = require('../models/login_history')
const mongoose = require('mongoose')

class middleware {

    auth = async (req, res, next) => {

        const { cookie_token } = req
        const { authorization } = req.headers

        if (authorization) {

            const token = authorization.split('Bearer ')[1]
            try {
                const user = await jwt.verify(token, 'asdasdasd')

                const device = await login_history.findOne({
                    $and: [
                        {
                            user_id: {
                                $eq: new mongoose.mongo.ObjectId(user._id)
                            }
                        },
                        {
                            user_agent: {
                                $eq: req.headers['user-agent']
                            }
                        },
                        {
                            token: {
                                $eq: cookie_token
                            }
                        }
                    ]
                })

                if (device) {
                    req.userInfo = {
                        _id: user._id,
                        name: user.name
                    }
                    next()
                } else {
                    return res.status(409).json({ message: 'unauthorized' })
                }
            } catch (error) {

                return res.status(409).json({ message: 'unauthorized' })
            }
        } else {
            return res.status(409).json({ message: 'unauthorized' })
        }
    }

    cookie_check = async (req, res, next) => {
        const { user_token } = req.cookies
        if (user_token) {
            req.cookie_token = user_token
            next()
        } else {
            req.cookie_token = ''
            next()
        }
    }
}

module.exports = new middleware()