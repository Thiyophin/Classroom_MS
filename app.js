var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var db=require('./config/connection')
var session=require('express-session')
var expressValidator = require('express-validator')
var fileUpload=require('express-fileupload')
var tutorRouter = require('./routes/tutor');
var studentRouter = require('./routes/student');
var app = express();
var MongoDBStore = require('connect-mongodb-session')(session);
const nocache = require('nocache')
require('dotenv').config();
const  swal  = require("sweetalert")
//console.log(process.env);

var store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: 'mySessions'
});
store.on('error', function(error) {
  console.log(error);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'key',cookie:{maxAge:	86400000},
store: store,
resave: true,
saveUninitialized: false}))
app.use(fileUpload());
app.use(nocache())
db.connect( (err)=>{
  if(err)console.log("connection error"+err);
  else console.log("Database connected");
})


app.use('/', tutorRouter);
app.use('/student', studentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
