const fs = require('fs');
const path = require('path');

module.exports = {
  getData(name) {
    try {
      const rawdata = fs.readFileSync(path.resolve(__dirname, `${name}.json`));
      return JSON.parse(rawdata);
    } catch (err) {
      console.error(name, err);
      return null;
    }
  },
};
