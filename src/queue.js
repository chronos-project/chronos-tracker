const { getUserAgent, appendMetadataToEvents } = require('./metadata');
const sendData = require('./sendData');
const API_URL = 'http://localhost:3000/api';

function createQueue(maxSize) {
  let queue = [];
  let size = 0;
  let max = maxSize;

  const Queue = {
    add (event) {
      queue.push(event);
      size += 1;
      this.checkMax();
    },

    checkMax () {
      if (size >= max) {
        this.flush();
      }
    },

    flush () {
      const data = appendMetadataToEvents(queue);
      const json = JSON.stringify({
        "ACCESS_KEY": "ad67cb6c0642ebb887bd5b3ad1b12121525238e48f36b403aa86c08068a3752075b45c4d6f60d6d3ef41e1132b149bc423ae5df60d56e4205814eac07f628a85",
        data
      });

      this.clear();
      sendData(`${API_URL}/events`, json);
    },

    clear () {
      queue = [];
      size = 0;
    },
  }

  return Object.create(Queue);
}

module.exports = createQueue;
