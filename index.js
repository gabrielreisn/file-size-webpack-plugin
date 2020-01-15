const fileSize = require("filesize");
const terser = require("terser");
const gzip = require("gzip-size");
const brotli = require("brotli-size");

const boxen = require("boxen");
const colors = require("colors");

const opt = { bits: true };

function render(info) {
  const primaryColor = "green";
  const secondaryColor = "yellow";

  const title = colors[primaryColor].bold;
  const value = colors[secondaryColor];

  const values = [
    [`${title("Destination: ")}${value(info.fileName)}`],
    [`${title("Bundle Size: ")} ${value(info.bundleSize)}`],
    [`${title("Minified Size: ")} ${value(info.minSize)}`],
    [`${title("Gzipped Size: ")} ${value(info.gzipSize)}`],
    [`${title("Brotli size: ")}${value(info.brotliSize)}`]
  ];

  return console.log(boxen(values.join("\n"), { padding: 1 }));
}

module.exports = class FileSizeWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "FileSizeWebpackPlugin",
      (compilation, callback) => {
        compilation.chunks.forEach(chunk => {
          chunk.files.forEach(filename => {
            const source = compilation.assets[filename].source();

            const minified = terser.minify(source).code;

            const info = {
              fileName: filename,
              bundleSize: fileSize(Buffer.byteLength(source), opt),
              gzipSize: fileSize(gzip.sync(source), opt),
              brotliSize: fileSize(brotli.sync(source), opt),
              minSize: minified && fileSize(minified.length, opt)
            };

            render(info);
          });
        });

        callback();
      }
    );
  }
};
