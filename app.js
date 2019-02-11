//****************************************************** */
//#region Declarations

const express = require('express');
const app = express();
const methodOverride = require('method-override');
const path = require('path');
const flash = require('connect-flash');
const reqflash = require('req-flash');
const logger = require('morgan');
const exphbs  = require('express-handlebars');
const router = express.Router({mergeParams: true});
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
var {ensureAuthenticated} = require('./helpers/auth');

const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const port = 3000;
//#endregion
//****************************************************** */

//****************************************************** */
//#region Configures routes
const users = require('./routes/users');
require('./config/passport')(passport);

//#endregion
//****************************************************** */

//****************************************************** */
//#region Folder and Utility Routes

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'));

app.use(passport.initialize());
app.use(passport.session());

//Setup body-parser to read req data in html
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//Setup Express Session
app.use(session({   
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));  

//Setup Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());

//extension of method library in HTML forms
app.use(methodOverride('_method'));
router.use('/users', users);

// app.use(flash());
// app.use(function(req,res){
//     res.locals.success_msg = req.flash("success_msg");
//     res.locals.error_msg = req.flash("error_msg");
//     res.locals.error = req.flash("error");
//     res.locals.user = req.user || null;
//     next();
// });
//#endregion
//****************************************************** */

//****************************************************** */
//#region Mongoose Initialization
mongoose.Promise = global.Promise;

var db = new mongoose.connect("mongodb://localhost:27017/dbs", {
    useMongoClient: {useNewUrlParser: true}
})
    .then(function () { console.log("MongoDB Connected") })
    .catch(function (err) { console.log(err) });

//Load entry models
require('./models/userEntry');
require('./models/defectentry');
require('./models/logentry');
require('./models/Entry');

//Assign Requirements
var User = mongoose.model('Users');
var Defect = mongoose.model('Defects');
var Log = mongoose.model('Logs');
//#endregion
//****************************************************** */

//****************************************************** */
//#region HandleBars Initialization
require('handlebars');
require('handlebars/runtime');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//#endregion
//****************************************************** */

//****************************************************** */
//#region HTML Routes

//Route to login page
router.get('/',function(req,res){
    res.render('users/login');
});

//Route to new user page
router.get('/users/newuser',function(req,res){
    res.render('newuser');
});

//Route to defects
router.get('/defectspage', /*ensureAuthenticated,*/function(req,res){
    var critical = 0;
    var high = 0;
    var moderate = 0;
    var low = 0;
    var nth = 0;

    Defect.countDocuments({severity:"Critical"},function(err,c){
        critical = c;
    });

    Defect.countDocuments({severity:"High"},function(err,h){
            high = h;
    });

    Defect.countDocuments({severity:"Moderate"},function(err,m){
            moderate = m;
    });

    Defect.countDocuments({severity:"Low"},function(err,l){
            low = l;
    });

    Defect.countDocuments({severity:"NTH"},function(err,n){
        nth = n;
    });

    Defect.find({}).then(function(allDefects){
        res.render('defectspage', {defects:allDefects, critical:critical, high:high, moderate:moderate, low:low, nth:nth});
    });
});

router.get('/reportdefect',function(req,res){
    Defect.count({}, function(err, count){
        res.render('defectentries/adddefect', {ticketnumber: 1000000000 + count});
    }).then(function(err, count){
    });
});

router.get('/login', function(req,res){
    res.render('users/login');
});

router.post('/log',function(req,res,next){
    passport.authenticate('local', {
        successRedirect:'/defectspage',
        failureRedirect:'/login'
    })(req,res,next);
});

//#endregion
//****************************************************** */

//****************************************************** */
//#region Post Actions

// app.post('/adddefect/:ticketnumber', function(req,res){
//     console.log(req.body);
//     var newDefect = {
//         ticket_number:req.body.,
//         defect_title:req.body.defect_title,
//         defect_description:req.body.defect_description,
//         severity:req.body.severity,
//         status:req.body.status,
//         assigned_to: req.body.assigned_to,
//         date:req.body.date
//     };
    
//     console.log(req.body.ticketnumber);
//     new Defect(newDefect).save()
//     .then(function(entry){
//         res.redirect('/defectspage');
//     })
//     console.log("Defect with ticket #" + req.body.ticket_number +" Successfully added to database")
// });

app.post('/adddefect/:ticketnumber', function(req,res){
    console.log(req.body);
    var newDefect = {
        ticket_number:req.params.ticketnumber,
        defect_title:req.body.defect_title,
        defect_description:req.body.defect_description,
        severity:req.body.severity,
        status:req.body.status,
        assigned_to: req.body.assigned_to,
        date:req.body.date
    };
    
    console.log(req.body.ticketnumber);
    new Defect(newDefect).save()
    .then(function(entry){
        res.redirect('/defectspage');
    })
    console.log("Defect with ticket #" + req.body.ticket_number +" Successfully added to database")
});

app.post('/loguser',function(req,res){

    User.find({user_id:req.body.user-id}).then(function(user){
        res.render('defectspage');
    }).catch(console.log);
});

// Route to update page and pass defect to update page fields
app.post('/update/:id', function(req,res){
    Defect.find({_id:req.params.id})
    .then(function(defect){
        console.log("Defect with ObjectId: " + req.params.id + " successfully updated")
        res.render('defectentries/updatedefect', {defect:defect});
    });
});

app.post('/view/:id',function(req,res){

    Defect.find({_id:req.params.id})
    .then(function(defect){
        var logs = Log.find({ticket_number:defect.ticket_number});

        console.log("Defect with ObjectId: " + req.params.id + " successfully updated")
        res.render('defectentries/viewdefect', {defect:defect, logs:logs});
    });
})

app.post('/addlog/:id', function(req,res){


    Defect.find({_id:req.params.id})
    .then(function(defect)
    {
        var log_number = 1;
        Log.countDocuments({ticket_number:defect.ticket_number}, function(err, count){
            log_number += count;
            console.log(log_number);
        });
        res.render('logentries/addlog', {defect:defect, log_number:log_number});
    })
});

app.post('/submitlog/:ticket_number',function(req,res){

    var defect = Defect.find({ticket_number:req.params.ticket_number});
    var log_number = 1;
    Log.countDocuments({ticket_number:defect.ticket_number}, function(err, count){
        log_number += count;
        console.log(log_number);
    });

    var newLog = {
        ticket_number:req.params.ticket_number,
        log_number:log_number,
        log_title:req.body.log_title,
        update_description:req.body.update_description,
    }

    new Log({
        ticket_number:req.params.ticket_number,
        log_number:log_number,
        log_title:req.body.log_title,
        update_description:req.body.update_description
    }).save()
    .then(function(){
        Defect.find({ticket_number:req.params.ticket_number})
        .then(function(defect){
            var logs = Log.find({ticket_number:req.params.ticket_number});
            // console.log(logs);
                res.render('defectentries/viewdefect', {defect:defect, logs:logs});
            });
    });
    



});

//Delete Defect Entry
app.post('/delete/:id', function(req,res){
    Defect.remove({_id:req.params.id})
    .then(function(){
        res.redirect('/defectspage');
        console.log("Defect with id: " +req.params.id + " Successfully deleted from database")
    });
});

//#endregion
//****************************************************** */

//****************************************************** */
//#region Connection
app.use('/', router);

//Start server
app.listen(port, function(){
    console.log("Server is running on port " + port);
});

//#endregion
//****************************************************** */

//****************************************************** */
//#region Update and Add to Database

// app.get('/', function(req, res){
//     console.log("Request made from fetch");
//     Entry.find({})
//     .then(function(entries){
//         res.render('index', {entries:entries})
//     });
// })

//Update Defect!
app.post('/updatedefect/:id', function(req,res){
    Defect.update({_id:req.params.id}, {
        defect_title:req.body.defect_title,
        defect_description:req.body.defect_description,
        severity:req.body.severity,
        status:req.body.status,
        assigned_to: req.body.assigned_to

    }, function(err, doc){
        if(err) return res.send(500, { error: err});
        res.redirect('/defectspage');
    });

});
//#endregion
//****************************************************** */