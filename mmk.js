const unified = require('unified');
const markdown = require('remark-parse');
const remark2rehype = require('remark-rehype');
const html = require('rehype-stringify');

function render(text, parsers, opts) {
  const processor = unified()
    .use(markdown, {
      footnotes: true,
      commonmark: true
    })
    .use(remark2rehype)
    .use(html);
  // .use(frontMatter)
  // .use(liquid)
  // .use(restoreUnescapedCharacter(text))
  // .use(mergeContinuousTexts)
  // .use(transformInlineCode)
  // .use(splitText(opts));

  return new Promise((resolve, reject) => {
    return processor.process(text, (err, file) => {
      if (err) reject(err);
      resolve(String(file));
    });
  });
}

render(`# hello world
[test](/test)
`)
  .then(console.log)
  .catch(console.error);
