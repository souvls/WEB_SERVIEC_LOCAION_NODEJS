const mongoose = require('mongoose')
const condb = require('../config/LoactionDB');
//design schema
let locationSchema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    name:String,
    desc:String,
    address:String,
    latitude:Number,
    longitude:Number,
    status:Boolean,
    rating:Number,
    category_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    img_name:Array
});

//create model
let location = condb.model("location",locationSchema);
module.exports = location;