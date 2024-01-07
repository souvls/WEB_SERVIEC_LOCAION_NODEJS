const mongoose = require('mongoose')
const condb = require('../config/UserDB')

let userSchema = mongoose.Schema({
    fullname:String,
    email:String,
    password:String,
    avatar:String,
    role:Boolean
});

let User = condb.model("Users",userSchema);
module.exports = User;