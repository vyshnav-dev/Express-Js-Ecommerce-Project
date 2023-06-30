const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const hbs=require('express-handlebars')

const handlebars=require('handlebars')



const app = express();
// var fileUpload=require('express-fileupload')
const db=require('./config/connection')
const session=require('express-session')
//var nocache=require("nocache")

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
//app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload())
app.use(session({secret:"Key",cookie:{maxAge:600000}}))



db.connect((err)=>{
  if(err)
  console.log("Connection Error"+err);
  else
  console.log("Database Connected to port 27017");

})
app.use('/', userRouter);
app.use('/admin', adminRouter);


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

handlebars.registerHelper('eq', function (value1, value2) {
  return value1 === value2;
});

handlebars.registerHelper('gt', function (value1, value2) {
  return value1 > value2;
});

handlebars.registerHelper('lt', function (value1, value2) {
  return value1 < value2;
});
handlebars.registerHelper('add', function (value1, value2) {
  return value1 + value2;
});

handlebars.registerHelper('nteq', function (value1, value2) {
  return value1 !== value2;
});

module.exports = app;
