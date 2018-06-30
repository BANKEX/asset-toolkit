const $path = require('path');
const EVENT = process.env.npm_lifecycle_event || '';
const ROOT = $path.resolve(__dirname, '..');

exports.root = $path.join.bind($path, ROOT);

exports.hasNpmFlag = (flag) => EVENT.includes(flag);

exports.processFlag = (flag) => {
  for (let i = 2; i < process.argv.length; i += 1) {
    if (process.argv[i] == `--${flag}`) {
      return process.argv[i+1];
    }
  }
}

exports.hasProcessFlag = (flag) =>
  process.argv.join('').indexOf(flag) > -1;

exports.isWebpackDevServer = () =>
  process.argv[1] && !! (/webpack-dev-server/.exec(process.argv[1]));

