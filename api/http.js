/* eslint-disable node/prefer-promises/fs */
const axios = require('axios').default;
const fs = require('fs');
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
const { getData } = require('../data/get');

const getErrorMessage = (error) => {
  if (has(error, 'response') && has(error.response, 'message'))
    return error.response.message;
  if (has(error, 'response') && has(error.response, 'msg'))
    return error.response.msg;
  if (has(error, 'message')) return error.message;
  return error;
};

module.exports = {
  writeDataToFile(data, file = 'currencies') {
    if (data) {
      console.log(`[DEBUG] [writeDataToFile ${file}]`, typeof data);
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
  },
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
      const currencies = [...getSyncCash(monobank, nationalbank)];
      currencies.splice(6, 0, ...btc);
      if (uahBtc) {
        currencies.splice(6, 0, uahBtc);
      }
      let history = getData('history-before');
      if (!history) {
        this.writeDataToFile(currencies, 'history-before');
        history = [];
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
      this.writeDataToFile(mapedCurrencies);
      this.writeDataToFile(moment(), 'date');
    });
  },
};
