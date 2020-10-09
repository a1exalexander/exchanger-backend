const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const moment = require('moment');
const http = require('./api/http');
const apiRouter = require('./routes/api');
const indexRouter = require('./routes');
const cors = require('cors');
const { getData } = require('./data/get');
const { writeDataToFile } = require('./api/http');
const app = express();
const CronJob = require('cron').CronJob;

const jobFetch = new CronJob(
  '0 * * * *',
  function () {
    console.log(`Start cron job fetch, ${moment().format('DD.MM.YYYY hh:mm')}`);
    http.fetchAll();
  },
  null,
  true
);

const jobHistory = new CronJob(
  '0 22 * * *',
  function () {
    console.log(
      `Start cron job history, ${moment().format('DD.MM.YYYY hh:mm')}`
    );
    const history = getData('history');
    const currencies = getData('currencies');
    writeDataToFile(history || currencies, 'history-before');
    writeDataToFile(currencies, 'history');
  },
  null,
  true
);

jobFetch.start();
jobHistory.start();
http.fetchAll();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', cors(), indexRouter);
app.use('/api', cors(), apiRouter);

module.exports = app;
