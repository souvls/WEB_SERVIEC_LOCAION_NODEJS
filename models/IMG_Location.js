const mongoose = require('mongoose')
const condb = require('../config/LoactionDB');
//design schema
let imgSchema = mongoose.Schema({
    LocationID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    Name:String
});

//create model
let Image = condb.model("image",imgSchema);
module.exports = Image;