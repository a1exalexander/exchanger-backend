const Big = require('big.js');
const { isArray, isFunction, isNumber } = require('lodash');
const cc = require('currency-codes');
const moment = require('moment');
const cryptocurrencies = require('cryptocurrencies');
const { has } = require('./check');
const { getCountry } = require('../data/currencies-names');

module.exports = {
  calcByA(val, rate, funcA, funcB) {
    if (isNumber(Number(val))) {
      if (isFunction(funcA)) funcA(val);
      const result = val !== '' ? new Big(val).mul(rate) : '';
      if (isFunction(funcB)) funcB(result);
    }
  },

  calcByB(val, rate, funcA, funcB) {
    if (isNumber(Number(val))) {
      funcA(val);
      const result = val !== '' ? new Big(Number(val)).div(rate) : '';
      funcB(result);
    }
  },

  calcMul(num, rate) {
    return num !== '' ? new Big(num).mul(rate).toString() : '';
  },

  calcDiv(num, rate) {
    return num !== '' ? new Big(num).div(rate).toString() : '';
  },

  getUahBtc(cash = [], crypto = []) {
    if (isArray(cash) && isArray(crypto)) {
      const USD = cash.find(
        (item) => item.currencyA.code === 'USD' && item.currencyB.code === 'UAH'
      );
      const BTC = crypto.find(
        (item) => item.currencyA.code === 'BTC' && item.currencyB.code === 'USD'
      );
      if (
        USD &&
        BTC &&
        USD.rateBuy &&
        BTC.rateBuy &&
        USD.rateSell &&
        BTC.rateSell
      ) {
        const newExchange = {
          id: `${USD.currencyCodeA}:${BTC.currencyCodeA}`,
          precision: 4,
          currencyCodeA: BTC.currencyCodeA,
          rateBuy: new Big(USD.rateBuy).mul(BTC.rateBuy).round(4).toString(),
          rateSell: new Big(USD.rateSell).mul(BTC.rateSell).round(4).toString(),
          currencyA: BTC.currencyA,
        };
        return { ...USD, ...newExchange };
      }
    }
    return undefined;
  },

  mapCurrencies(item) {
    const { currencyCodeA, currencyCodeB } = item;
    const newItem = {
      ...item,
      id: `${currencyCodeA}:${currencyCodeB}`,
      precision: 4,
      currencyA: cc.number(currencyCodeA) || {},
      currencyB: cc.number(currencyCodeB) || {},
      date: moment(item.date, 'X').format('DD MMMM YYYY'),
    };
    newItem.currencyA.country = has(newItem.currencyA, 'code')
      ? getCountry(newItem.currencyA.code)
      : '';
    newItem.currencyB.country = has(newItem.currencyB, 'code')
      ? getCountry(newItem.currencyB.code)
      : '';
    return newItem;
  },

  getSyncCash(MONOCurrencies = [], NBCurrencies = []) {
    const result = MONOCurrencies.map((item) => {
      const {
        currencyA: { code = '' },
      } = item;
      const extra = NBCurrencies.find(({ cc = '' }) => cc === code);
      const result = { ...item };
      if (extra) result.NB = extra;
      return result;
    });
    return result;
  },

  filterCurrencies(item) {
    const { currencyA, currencyB } = item;
    return has(currencyA, 'code') && has(currencyB, 'code');
  },

  mapBTC(item) {
    const { base_ccy, ccy } = item;
    const newItem = {
      id: `${ccy}:${base_ccy}`,
      precision: 6,
      currencyCodeA: ccy,
      currencyCodeB: base_ccy,
      rateBuy: Number(item.buy),
      rateSell: Number(item.sale),
      currencyA: {
        code: ccy,
        currency: cryptocurrencies[ccy],
      },
      currencyB: cc.code(base_ccy),
    };
    return newItem;
  },

  formatCurrency(currencyCode) {
    const newItem = cc.number(currencyCode);
    newItem.country = getCountry(newItem.code);
    return newItem;
  },

  cutNumber(num, precision = 4) {
    if (!precision) return Math.round(Number(num));
    const x = String(num);
    const idx = x.indexOf('.');
    const decimals = x.substr(idx + 1, precision);
    const int = x.slice(0, idx);
    return `${int}.${decimals}`;
  },

  removeZero(num) {
    let x = String(num);
    return x.length > 1 && x[0] === '0' ? x.slice(1) : x;
  },

  toFix(num, precision = 4) {
    if (isNumber(Number(num))) return '';
    let x = String(num);
    return ~x.indexOf('.') ? this.cutNumber(x, precision) : this.removeZero(x);
  },
};
