const mongoose = require('mongoose')
const condb = require('../config/UserDB')

let userSchema = mongoose.Schema({
    Fullname:String,
    Email:String,
    Password:String,
    Avatar:String,
    Role:Boolean
});

let User = condb.model("Users",userSchema);
module.exports = User;