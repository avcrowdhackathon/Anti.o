const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const override = require('method-override');

const apiRouter = require('./src/api');
const newsRouter = require('./src/news');

/* App Initialization */
const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'client/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); // shows all the requests on console
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(override());

app.use('/api', apiRouter);
app.use('/news', newsRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// catch if any error
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send('oops');
});

module.exports = app;
