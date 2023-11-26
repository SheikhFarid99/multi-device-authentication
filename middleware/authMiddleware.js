const jwt = require('jsonwebtoken')
const login_history = require('../models/login_history')
const mongoose = require('mongoose')

module.exports.middleware = async (req, res, next) => {

    const { authorization } = req.headers

    if (authorization) {

        const token = authorization.split('Bearer ')[1]
        try {
            const user = await jwt.verify(token, 'asdasdasd')
            console.log(user)
            const device = await login_history.findOne({
                $and: [
                    {
                        user_id: {
                            $eq: new mongoose.mongo.ObjectId(user._id)
                        }
                    },
                    {
                        device: {
                            $eq: req.headers['user-agent']
                        }
                    }
                ]
            })
            console.log(device)
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
            console.log(error)
            //return res.status(409).json({ message: 'unauthorized' })
        }
    } else {
        //return res.status(409).json({ message: 'unauthorized' })
    }
}