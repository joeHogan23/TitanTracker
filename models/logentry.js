var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
    
    
    ticket_number:{
        type:Number,
        required:true
    },

    log_number:{
        type:String,
        required:true
    },

    log_title:{
        type:String,
        required:true
    },

    update_description:{
        type:String,
        required:true
    },

    reviewed:{
        type:Boolean,
        default:false
    },

    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Logs', LogSchema);
