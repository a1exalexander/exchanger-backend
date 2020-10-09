const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const moment = require('moment');
const http = require('./api/http');
const apiRouter = require('./routes/api');
const indexRouter = require('./routes');
const cors = require('cors');
const app = express();
const CronJob = require('cron').CronJob;

const job = new CronJob(
  '0 * * * *',
  function () {
    console.log(`Start cron job, ${moment().format('DD.MM.YYYY hh:mm')}`);
    http.fetchAll();
    return;
  },
  null,
  true
);
job.start();
http.fetchAll();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', cors(), indexRouter);
app.use('/api', cors(), apiRouter);

module.exports = app;
