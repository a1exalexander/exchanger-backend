const express = require('express');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { getData } = require('../data/get');
const router = express.Router();

router.get(`/`, (req, res) => {
  res.send({
    'last update': '/date',
    currencies: '/currencies',
  });
});

router.get(`/date`, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data', `date.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  } catch {
    res.statusCode(404);
  }
});

router.get(`/currencies`, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data', `currencies.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  } catch {
    res.statusCode(404);
  }
});

router.get(`/yesterday`, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data', `history.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  } catch {
    res.statusCode(404);
  }
});

router.get(`/before-yesterday`, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data', `history-before.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  } catch {
    res.statusCode(404);
  }
});

router.get(`/yesterday-date`, (req, res) => {
  try {
    const date = getData('yesterday');
    const formatedDate = date ? moment(date).format('DD MMMM YYYY') : date;
    res.send(formatedDate);
  } catch {
    res.statusCode(404);
  }
});

router.get(`/before-yesterday-date`, (req, res) => {
  try {
    const date = getData('before-yesterday');
    const formatedDate = date ? moment(date).format('DD MMMM YYYY') : date;
    res.send(formatedDate);
  } catch {
    res.statusCode(404);
  }
});

module.exports = router;
