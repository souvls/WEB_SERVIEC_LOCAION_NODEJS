const mongoose = require('mongoose')
const condb = require('../config/LoactionDB');
//design schema
let imgSchema = mongoose.Schema({
    location_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    name:String
});

//create model
let Image = condb.model("image",imgSchema);
module.exports = Image;