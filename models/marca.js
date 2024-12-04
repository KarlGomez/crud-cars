const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
const {mongo} = require("mongoose");


const marca = mongoose.model('marca',
    mongoose.Schema({
        id : mongoose.Schema.Types.ObjectId,
        nombre : String,
        fundadores : String,
        fundacion : String
    }, { versionKey : false }

    ));

module.exports = marca