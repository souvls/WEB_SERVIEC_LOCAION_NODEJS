const mongoose = require('mongoose')
const condb = require('../config/Comment');
//design schema
let commentSchema = mongoose.Schema({
    UserID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'uers'
    },
    LocationID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location'
    },
    Message: String,
    Create_at: Date,
    Status: Boolean
});

//create model
let comment = condb.model("comment",commentSchema);
module.exports = comment;