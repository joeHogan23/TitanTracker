var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    user_id: {
        type:Number,
        required:true
    },

    password:{
        type:String,
        required: true
    },

    first_name:{
        type:String,
        required:true
    },
    
    middle_name:{
        type:String,
        required: false
    },

    last_name:{
        type:String,
        required:true
    },

    date_of_birth:{
        type:String,
        required: true
    },

    work_email:{
        type:String,
        default: ""
    },

    role:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Users', UserSchema);
