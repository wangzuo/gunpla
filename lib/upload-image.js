const fs = require('fs');
const path = require('path');
const request = require('request');
const Storage = require('@google-cloud/storage');
const crypto = require('crypto');
const v = require('./v');

const storage = Storage({ projectId: 'one-punch-26a84' });
const bucket = storage.bucket('gunpla');
const cachePath = path.join(__dirname, '../build/images.json');
const images = (function() {
  try {
    return require(cachePath);
  } catch (e) {
    return {};
  }
})();

function uploadImage(url) {
  const m = url.match(/v\.onepunch\.co\/.*\/.*\/(.*)/);
  if (m) return m[1];

  const hmac = crypto.createHmac('sha1', 'mdit');
  const digest = hmac.update(url).digest('hex');
  const extname = path.extname(url);
  const filename = `${digest}${extname}`;

  if (images[url]) {
    return images[url];
  }

  console.log('uploading', filename);

  return new Promise((resolve, reject) => {
    const stream = bucket.file(filename).createWriteStream({
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    request.get(url).pipe(stream);

    stream.on('error', err => reject(err));
    stream.on('finish', () => {
      images[url] = filename;

      fs.writeFileSync(
        cachePath,
        JSON.stringify(images, '', 2),
        'utf-8'
      );

      resolve(filename);
    });
  });
}

module.exports = uploadImage;
