const browserify = require('browserify');
const envify = require('envify/custom');
const babelify = require('babelify');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));

browserify('src/tracker.js').transform(envify({
  queueSize: config.queueSize,
  errorHandling: config.errorHandling,
  events: config.events,
}))
.transform(babelify, {
  presets: [['@babel/preset-env', {targets: '> 0.25%, not dead'}]]
})
.bundle().pipe(fs.createWriteStream('javascripts/tracker.js'));
