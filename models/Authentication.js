const mongoose = require('mongoose')
const condb = require('../config/UserDB');
//design schema
let authenticationSchema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    refresh_token:String
});

//create model
let Authentication = condb.model("Authentications",authenticationSchema);

module.exports = Authentication;