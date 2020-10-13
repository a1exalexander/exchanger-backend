const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const apiRouter = require('./routes/api');
const indexRouter = require('./routes');
const cors = require('cors');
const { cronJob, cronJobFn } = require('./cron');
const app = express();

// Cron
cronJob.start();

// Plugins
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Router
app.get('/', cors(), indexRouter);
app.use('/api', cors(), apiRouter);

cronJobFn();

module.exports = app;
