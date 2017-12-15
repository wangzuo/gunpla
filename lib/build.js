const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const fm = require('front-matter');
const glob = require('glob');
const uploadImage = require('./upload-image');
const renderMd = require('./markdown');

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
  const html = await renderMd(body);
  const post = {
    title: attributes.title,
    source: attributes.source,
    cover: await uploadImage(attributes.cover),
    slug,
    // date: `${year}年${month}月${day}日`,
    href: `/mb/${slug}`,
    html
  };

  mkdirp.sync(dir);

  fs.writeFileSync(
    path.join(dir, `${slug}.html`),
    post.html,
    'utf-8'
  );

  return post;
}

buildFile('./source/mb/destiny-gundam.md').then(console.log).catch(console.error);
