const { getData } = require('./data/get');
const moment = require('moment');
const { writeDataToFile } = require('./api/http');
const http = require('./api/http');
const { isArray } = require('lodash');
const CronJob = require('cron').CronJob;

const cronJobFn = () => {
  console.log(`[INFO] Start cron job, ${moment().format('DD.MM.YYYY hh:mm')}`);
  http.fetchAll();
  const yesterday = moment().subtract(1, 'day');
  const beforeYesterday = moment().subtract(2, 'day');
  const dateYesterday = getData('yesterday');
  const dateBeforeYesterday = getData('before-yesterday');
  const currencies = getData('currencies');
  const history = getData('history');
  const historyBefore = getData('history-before');
  const isSameYestardey = moment(yesterday).isSame(dateYesterday, 'day');
  const isSameBeforeYestardey = moment(beforeYesterday).isSame(
    dateBeforeYesterday,
    'day'
  );
  console.log(`[DEBUG] Is Same Yesterday => ${isSameYestardey}`);
  console.log(`[DEBUG] Is Same Before Yesterday => ${isSameBeforeYestardey}`);
  if (!isSameYestardey || !isArray(history) || history.length < 3) {
    writeDataToFile(currencies, 'history');
    writeDataToFile(yesterday, 'yesterday');
  }
  if (!isSameBeforeYestardey || !isArray(historyBefore) || historyBefore.length < 3) {
    writeDataToFile(history || currencies, 'history-before');
    writeDataToFile(yesterday, 'before-yesterday');
  }
  console.log(`[INFO] End cron job, ${moment().format('DD.MM.YYYY hh:mm')}`);
};

module.exports = {
  cronJob: new CronJob('0 * * * *', cronJobFn, null, true),
  cronJobFn,
};
