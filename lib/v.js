const crypto = require('crypto');

const DEFAULT = {
  s: 'gcs',
  b: 'gunpla'
};

module.exports = function(name, o) {
  const options = Object.assign({}, DEFAULT, o);
  // todo: key
  const hmac = crypto.createHmac('sha1', 'v.onepunch.co');
  const x = Object.keys(options)
    .filter(x => options[x])
    .sort()
    .map(x => `${x}_${options[x]}`)
    .join(',');
  const digest = hmac.update(x).digest('hex');

  return `https://v.onepunch.co/${x}/${digest}/${name}`;
};
