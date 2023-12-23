const mongoose = require('mongoose')
const condb = require('../config/LoactionDB');
//design schema
let locationSchema = mongoose.Schema({
    UserID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    Name:String,
    DESC:String,
    Address:String,
    Latitude:Number,
    Longitude:Number,
    Status:Boolean,
    Rating:Number,
    Category_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    ImgName:Array
});

//create model
let location = condb.model("location",locationSchema);
module.exports = location;