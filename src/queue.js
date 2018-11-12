const { getUserAgent, appendMetadataToEvents } = require('./metadata');
const sendData = require('./sendData');
const API_URL = 'http://localhost:3000/api';

function createQueue(maxSize) {
  let buffer = [];
  let size = 0;
  let max = maxSize;

  const Queue = {
    add (event) {
      buffer.push(event);
      size += 1;
      this.checkMax();
    },

    checkMax () {
      if (size >= max) {
        console.log('flushing!');
        this.flush();
      }
    },

    flush () {
      const json = JSON.stringify(appendMetadataToEvents(buffer));

      this.clear();
      sendData(`${API_URL}/testing`, json);
    },

    clear () {
      buffer = [];
      size = 0;
    },
  }

  return Object.create(Queue);
}

module.exports = createQueue;
