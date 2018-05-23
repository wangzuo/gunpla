const _ = require('lodash');
const fs = require('fs');
const pug = require('pug');
const path = require('path');
const mkdirp = require('mkdirp');
const fm = require('front-matter');
const glob = require('glob');
const v = require('./v');
const uploadImage = require('./upload-image');
const renderMd = require('./markdown');

const tmpl = pug.compileFile(path.join(__dirname, './templates/post.pug'));

async function build(files) {
  const posts = [];

  for (const file of files) {
    const post = await buildFile(file);

    delete post.html;

    posts.push(post);
  }

  fs.writeFileSync(
    './posts/index.json',
    JSON.stringify(_.reverse(posts), '', 2),
    'utf-8'
  );
}

async function buildFile(filepath) {
  const filename = path.basename(filepath, '.md');
  console.log('building', filename);

  const slug = filename;
  const content = fs.readFileSync(filepath, 'utf-8');
  const { attributes, body } = fm(content);
  const dir = path.join('build', 'mb');
  const href = `/mb/${slug}`;
  const html = await renderMd(body);
  const images = [];

  for (const img of attributes.images) {
    images.push(await uploadImage(img));
  }

  const post = {
    name: await attributes.name,
    cover: await uploadImage(attributes.cover),
    images,
    slug,
    href,
    html
  };

  console.log(post);

  mkdirp.sync(dir);

  fs.writeFileSync(path.join(dir, `${slug}.html`), tmpl({ post, v }), 'utf-8');

  return post;
}

buildFile('./source/mb/00q.md')
  .then(console.log)
  .catch(console.error);
