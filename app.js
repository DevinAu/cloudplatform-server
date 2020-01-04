var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var session = require("express-session");
var cookieParser = require('cookie-parser');

var app = express();

/* 
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  next();
}); */
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,DELETE,OPTIONS");
  res.header('Access-Control-Allow-Credentials', true); 
  if (req.method.toLowerCase() == 'options')
    res.send(200);  //让options尝试请求快速结束
  else
    next();
})

app.use(session({
  secret: 'Devin',
  cookie: {
    maxAge: 1000*60*60*12,//12h后session和相应的cookie失效过期
    activeDuration: 1000*60*10, // 激活时间，10分钟内用户有服务器的交互，那么就会被重新激活。
  },  
  resave: false,
  saveUninitialized: true,
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* 
app.use(function (req, res, next) {
  var url = req.originalUrl;
  if (url != "/" && undefined == req.session.user) {
        res.send('<script>top.location.href="/";</script>');　　　　　　//解决内嵌iframe时session拦截问题
        return;
    }
    next()
  }); */

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
