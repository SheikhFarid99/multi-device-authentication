const { Schema, model } = require('mongoose')

const user_schema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    device: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = model('login_historys', user_schema)