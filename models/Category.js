const mongoose = require('mongoose')
const condb = require('../config/LoactionDB');
//design schema


let cgrSchema = mongoose.Schema({
    name: String
});

//create model
let cgr = condb.model("category",cgrSchema);
module.exports = cgr;