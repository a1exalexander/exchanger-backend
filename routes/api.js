const express = require('express');
const getUrls = require('../api/urls');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get(`/`, (req, res, next) => {
  res.send({
    'last update': '/date',
    currencies: '/currencies',
  });
});

router.get(`/date`, (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../data', `date.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  } catch {
    res.statusCode(404);
  }
});

router.get(`/currencies`, (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../data', `currencies.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  } catch {
    res.statusCode(404);
  }
});

module.exports = router;
