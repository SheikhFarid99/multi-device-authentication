const { Schema, model } = require('mongoose')

const user_schema = new Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    user_agent: {
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
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    device_info: {
        os: {
            type: String,
            default: ''
        },
        model: {
            type: String,
            default: ''
        },
        browser: {
            type: String,
            default: ''
        }
    }
}, { timestamps: true })

module.exports = model('login_historys', user_schema)