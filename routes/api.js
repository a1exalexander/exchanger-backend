const express = require('express');
const getUrls = require('../api/urls');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get(`/`, (req, res, next) => {
  res.send('Exchanger API');
});

[...Object.keys(getUrls()), 'date'].forEach((name) => {
  router.get(`/${name}`, (req, res, next) => {
    console.log(name);
    const filePath = path.join(__dirname, '../data', `${name}.json`);
    const readable = fs.createReadStream(filePath);
    readable.pipe(res);
  });
});

module.exports = router;
