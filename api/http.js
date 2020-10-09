const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const getUrls = require('./urls');
const { isArray } = require('lodash');
const {
  mapCurrencies,
  filterCurrencies,
  mapBTC,
  getSyncCash,
  getUahBtc,
} = require('../helpers/format');
const { has } = require('../helpers/check');

const formatTime = 'hh:mm:ss'
const isBetweenTime = () => {
  const now = moment();
  const beforeTime = moment('23:00:00', formatTime);
  const afterTime = moment('01:00:00', formatTime);
  return now.isBetween(beforeTime, afterTime);
}

const writeDataToFile = (data, file = 'currencies') => {
  if (data) {
    fs.writeFile(
      `./data/${file}.json`,
      JSON.stringify(data),
      'utf8',
      (error) => {
        if (error) console.log(`[ERROR] ${file} => `, error);
        console.log(`[SUCCESS] ${file} => writed to ${file}.json`);
      }
    );
  }
};

const getErrorMessage = (error) => {
  if (has(error, 'response') && has(error.response, 'message'))
    return error.response.message;
  if (has(error, 'response') && has(error.response, 'msg'))
    return error.response.msg;
  if (has(error, 'message')) return error.message;
  return error;
};

module.exports = {
  fetchMonobank() {
    return new Promise((resolve) => {
      console.log(`[INFO] start fetching "monobank" data`);
      axios
        .get(getUrls().monobank)
        .then(({ data }) => {
          if (isArray(data) && data.length) {
            const formatedData = data
              .map(mapCurrencies)
              .filter(filterCurrencies);
            console.log(`[SUCCESS] success fetching "monobank" data`);
            resolve(formatedData);
          } else {
            resolve([]);
          }
        })
        .catch((err) => {
          console.log(`[ERROR] failure fetching "monobank" data`);
          console.error(getErrorMessage(err.response));
          resolve([]);
        });
    });
  },

  fetchBTC() {
    return new Promise((resolve) => {
      console.log(`[INFO] start fetching "btc" data`);
      axios
        .get(getUrls().btc)
        .then(({ data }) => {
          if (isArray(data) && data.length) {
            const formatedData = data.map(mapBTC);
            console.log(`[SUCCESS] success fetching "btc" data`);
            return resolve(formatedData);
          } else {
            resolve([]);
          }
        })
        .catch((err) => {
          console.log(`[ERROR] failure fetching "btc" data`);
          console.error(getErrorMessage(err));
          resolve([]);
        });
    });
  },

  fetchNationalbank() {
    return new Promise((resolve) => {
      console.log(`[INFO] start fetching "nationalbank" data`);
      axios
        .get(getUrls().nationalbank)
        .then(({ data }) => {
          if (isArray(data) && data.length) {
            console.log(`[SUCCESS] success fetching "nationalbank" data`);
            resolve(data);
          } else {
            resolve([]);
          }
        })
        .catch((err) => {
          console.log(`[ERROR] failure fetching "nationalbank" data`);
          console.error(getErrorMessage(err));
          resolve([]);
        });
    });
  },

  fetchAll() {
    console.log(`[INFO] start fetching all data`);
    Promise.all([
      this.fetchMonobank(),
      this.fetchBTC(),
      this.fetchNationalbank(),
    ]).then(([monobank, btc, nationalbank]) => {
      console.log(`[SUCCESS] success fetching "all" data`);
      const uahBtc = getUahBtc(monobank, btc);
      const syncCash = getSyncCash(monobank, nationalbank);
      const currencies = [...syncCash, ...btc];
      if (uahBtc) {
        currencies.push(uahBtc);
      }
      let history = [];
      try {
        const rawdata = fs.readFileSync(
          path.resolve(__dirname, '../data', 'history.json')
        );
        history = [...JSON.parse(rawdata || [])];
      } catch (err) {
        writeDataToFile(currencies, 'history');
        console.error('history', err);
      }
      const mapedCurrencies = currencies.map((exchange) => {
        const getGrow = () => {
          const { rateSell, grow } =
            history.find((historyItem) => historyItem.id === exchange.id) || {};
          if (!rateSell) {
            return 0;
          } else if (Number(exchange.rateSell) < Number(rateSell)) {
            return -1;
          } else if (Number(exchange.rateSell) > Number(rateSell)) {
            return 1;
          } else {
            return grow;
          }
        };
        return { ...exchange, grow: getGrow() };
      });
      writeDataToFile(mapedCurrencies);
      if (isBetweenTime()) {
        console.error('[SUCCESS] => set new history');
        writeDataToFile(mapedCurrencies, 'history');
      }
      writeDataToFile(moment(), 'date');
    });
  },
};
