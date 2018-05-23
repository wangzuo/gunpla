const path = require('path');
const express = require('express');

const app = express();

app.use(
  '/',
  express.static(path.join(__dirname, 'build'), { extensions: ['html'] })
);

app.listen(4000, () => {
  console.log('listening on 4000');
});
