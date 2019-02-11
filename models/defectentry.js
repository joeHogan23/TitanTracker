var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var date = new Date();

var DefectSchema = new Schema({

    ticket_number:{
        type:String
    },

    defect_title:{
        type:String,
        required:true
    },
    defect_description:{
        type:String,
        required:true
    },

    severity:{
        type:String,
        required:true
    },

    status:{
        type:String,
        required:true
    },

    assigned_to:{
        type:String,
        required:false,
        default: "No one"
    },

    found_by:{
        type:String
    },

    date:{
        type:String,
        default:(date.getDate() < 10 ? "0" : "") + date.getDate() 
         + '-' + ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) 
         + '-' + date.getFullYear() + "   " + 
         (date.getHours() < 10 ? "0" : "") + date.getHours() 
         + ":" + (date.getMinutes() < 10 ? "0": "") + date.getMinutes() 
         + ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds()
    }
});

module.exports = mongoose.model('Defects', DefectSchema);