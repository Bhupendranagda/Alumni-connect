const mongoose = require('mongoose');

// userSchema

const ourstoriesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    currentcomp:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    oldcomp:{
        type:String,
        required:true
    },
    skills:{
        type:String,
        required:true
    },
    year: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
});

let Ourstories = module.exports = mongoose.model('Ourstories', ourstoriesSchema);