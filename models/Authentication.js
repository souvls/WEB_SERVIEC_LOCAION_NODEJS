const mongoose = require('mongoose')
const condb = require('../config/UserDB');
//design schema
let authenticationSchema = mongoose.Schema({
    UserID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    Refresh_Token:String
});

//create model
let Authentication = condb.model("Authentications",authenticationSchema);

module.exports = Authentication;