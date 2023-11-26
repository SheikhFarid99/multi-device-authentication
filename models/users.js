const { Schema, model } = require('mongoose')
const user_schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = model('users', user_schema)