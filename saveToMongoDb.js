var express = require('express');
var mongoose=require('mongoose');
var db=mongoose.connect('mongodb://localhost:27017/imagz');
var Schema=mongoose.Schema;
var detailsSchema=new Schema({
    url: String,
    txt: String,
    imgz: Array  
});
var userData=mongoose.model('imgz',detailsSchema);
exports.saveData = function (item) { // making saveData acessible by  outside world
       var data=new userData(item);
       
       var promise = data.save();
       return promise;
}
exports.closeConnection= function () { //closing connection
   mongoose.connection.close();
}