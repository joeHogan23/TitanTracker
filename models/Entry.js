var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
    title:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Games', GameSchema);