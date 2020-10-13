const fs = require('fs');
const path = require('path');

module.exports = {
  getData(name) {
    try {
      const rawdata = fs.readFileSync(path.resolve(__dirname, `${name}.json`));
      console.log(`[DEBUG] [rawdata "${name}"]`, typeof rawdata);
      return rawdata ? JSON.parse(rawdata) : null;
    } catch (err) {
      console.error(`[ERROR] [getData] [${name}]`, err);
      return null;
    }
  },
};
