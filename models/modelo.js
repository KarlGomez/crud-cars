const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
const {mongo, version} = require("mongoose");


const modelo = mongoose.model('modelo',
    mongoose.Schema({
        id : mongoose.Schema.Types.ObjectId,
        nombre : String,
        fabricado : String,
        anyo : Number,
        maxPotencia : String,
        numAsientos : Number,
        image_url : String,
        marca : {
            _id : String,
            nombre : String,
            fundadores : String,
            fundacion : String
        }}, { versionKey : false }
    ));

module.exports = modelo