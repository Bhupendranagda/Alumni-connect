const mongoose = require('mongoose');

// Userschema

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

let Userschema = module.exports = mongoose.model('Userschema', UserSchema);