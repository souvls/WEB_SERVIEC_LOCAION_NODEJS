const mongoose = require('mongoose')
const condb = require('../config/Comment');
//design schema
let Schema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    location_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location'
    },
});

//create model
let favorit = condb.model("favourite",Schema);
module.exports = favorit;