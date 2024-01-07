const mongoose = require('mongoose')
const condb = require('../config/Comment');
//design schema
let commentSchema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    location_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location'
    },
    message: String,
    create_at: Date,
    status: Boolean
});

//create model
let comment = condb.model("comment",commentSchema);
module.exports = comment;