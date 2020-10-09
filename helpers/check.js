module.exports = {
  has: (obj, key) => {
    if (typeof obj !== 'object') return false;
    return Object.prototype.hasOwnProperty.call(obj, key);
  },
};
