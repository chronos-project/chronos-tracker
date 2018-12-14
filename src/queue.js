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
        this.flush();
      }
    },

    flush () {
      const data = appendMetadataToEvents(buffer);
      const json = JSON.stringify({
        "ACCESS_KEY": "922644b1d1e76d4819f3e4d37cba5c93780ce90314954c1046e7e7dc56fc840a925764b4aa41e89523a0ac4ecb5a79b15e32e87de4d12cbd7479ab73693990f1",
        data
      });

      this.clear();
      sendData(`${API_URL}/events`, json);
    },

    clear () {
      buffer = [];
      size = 0;
    },
  }

  return Object.create(Queue);
}

module.exports = createQueue;
