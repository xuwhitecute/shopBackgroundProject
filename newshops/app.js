var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");

var index = require('./routes/index');
var users = require('./routes/users');
var nodeserver=require("./routes/nodeserver");
var home=require("./routes/home");
var goods=require("./routes/goods");
var stuffs=require("./routes/stuffs");
var members=require('./routes/members');
var logistics=require('./routes/logistics');
var orders=require("./routes/orders")
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret:"recommend 128 bytes random string",
  cookie:{maxAge:1000*60*20},   // session 存在时长
  resave:true,  // 自动保存
  saveUninitialized:true
}))



app.use("/libjs",express.static(path.join(__dirname,"public/javascripts")));
app.use("/libcss",express.static(path.join(__dirname,"public/stylesheets")));
app.use("/actions",express.static(path.join(__dirname,"actions")));


app.use('/', index);
app.use('/users', users);
app.use('/nodeserver',nodeserver);
app.use('/home',home);
app.use('/goods',goods);
app.use('/stuffs',stuffs);
app.use('/members',members);
app.use('/logistics',logistics);
app.use("/orders",orders);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
