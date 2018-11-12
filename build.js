var browserify = require('browserify')
  , envify = require('envify/custom')
  , fs = require('fs')

var b = browserify('src/tracker.js')
  , output = fs.createWriteStream('javascripts/tracker.js')

const config = JSON.parse(fs.readFileSync('config.json'));

b.transform(envify({
  queueSize: config.queueSize,
  errorHandling: config.errorHandling,
  events: config.events,
}))
b.bundle().pipe(output)
