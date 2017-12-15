const request = require('request');
const MarkdownIt = require('markdown-it');
const uploadImage = require('./upload-image');
const v = require('./v');

const md = new MarkdownIt();
md.use(videoPlugin);

md.renderer.rules.image = function(tokens, idx, options, env, self) {
  const token = tokens[idx];
  const caption = token.content;
  const src = token.attrGet('src');

  return `<figure><img src="${v(
    src
  )}" alt="${caption}" /> <figcaption>${caption}</figcaption></figure>`;
};

async function parse(text) {
  const tokens = md.parse(text);

  for (const token of tokens) {
    if (token.content[0] === '@' && token.content[1] === '[') {
      const match = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/im.exec(
        token.content
      );
      const service = match[1];
      const videoId = match[2];
      let video = {};

      if (service === 'bilibili') {
        video = await bilibili(videoId);
        video.image = await uploadImage(video.image);
        // } else if (service === 'qq') {
        //   video = await qq(videoId);
      }

      token.type = 'video';
      token.attrs = video;
    } else if (token.type === 'inline') {
      for (const child of token.children) {
        if (child.type === 'image') {
          for (const [i, [k, v]] of child.attrs.entries()) {
            if (k === 'src') {
              child.attrs[i][1] = await uploadImage(v);
            }
          }
        }
      }
    }
  }

  return md.renderer.render(tokens, md.options);
}

function videoPlugin(md) {
  md.renderer.rules.video = function(tokens, idx) {
    const token = tokens[idx];
    const { attrs } = token;
    const btn = `
<svg class="video-overlay-play-button" viewBox="0 0 200 200" alt="Play video">
  <circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#fff">
  </circle>
  <polygon points="70, 55 70, 145 145, 100" fill="#fff"></polygon>
</svg>
    `;

    return `<div class="post-video">
    <a href="${attrs.url}" target="_blank"><img src="${v(attrs.image)}" alt="${
      attrs.title
    }">${btn}</a><div class="post-video-title">${attrs.title}</div></div>`;
  };
}

function qq(videoId) {
  return `<div class="embed-responsive embed-responsive-16by9"><iframe frameborder="0" width="640" height="498" src="https://v.qq.com/iframe/player.html?vid=${videoId}&tiny=0&auto=0"></iframe></div>`;
}

function bilibili(videoId) {
  return new Promise((resolve, reject) => {
    request.get(
      `https://m.bilibili.com/video/${videoId}.html`,
      (err, resp, body) => {
        if (err) return reject(err);

        const m1 = body.match(/<meta property="og:title" content="(.*)"\/>/);
        const m2 = body.match(/<meta property="og:image" content="(.*)"\/>/);
        const m3 = body.match(/<meta property="og:url" content="(.*)"\/>/);

        if (m1 && m2 && m3) {
          const video = {
            title: m1[1],
            image: m2[1].replace(/@.*/g, ''),
            url: m3[1]
          };

          return resolve(video);
        }
      }
    );
  });
}

module.exports = parse;
