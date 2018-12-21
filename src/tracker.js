const createQueue = require('./queue');
const queue = createQueue(process.env['queueSize']);

const getEventData = (eType, e) => {
  const timestamp = Date.now();

  switch (eType) {
    case 'link_clicks':
      return [
        eType,
        e.target.firstChild.textContent, // linkText
        e.target.href, // targetURL
        timestamp
      ];
    case 'clicks':
      return [
        eType,
        e.target.nodeName, // target_node
        e.buttons, // buttons
        e.clientX, // x
        e.clientY, // y
        timestamp
      ];
    case 'mouse_moves':
      return [
        eType,
        e.x, // x
        e.y, // y
        timestamp
      ];
    case 'key_presses':
      return [
        eType,
        e.key, // key
        timestamp
      ];
    case 'form_submissions':
      const inputs = [...e.target.elements].filter(e => e.tagName === 'INPUT');
      const data = {};

      inputs.forEach(input => data[input.name] = input.value);

      return [
        eType,
        data,
        timestamp
      ];
    case 'pageviews': {
      return [
        eType,
        window.location.href, // url
        document.title, // title
        timestamp
      ];
    }
    default:
      return [];
  }
}

const addToQueue = (eType, e) => {
  let eventObj = getEventData(eType, e);
  queue.add(getEventData(eType, e));
}

document.addEventListener('DOMContentLoaded', function(event) {
  let mousePos;
  let prevMousePos;

  const events = process.env['events'];

  window.addEventListener('beforeunload', event => {
    queue.flush();
  });

  if (events.pageviews) {
    (() => {
      addToQueue('pageviews');
    })();
  }

  if (events.clicks && events.linkClicks) {
    document.addEventListener('click', function(event) {
      if (event.target.tagName === 'A') {
        addToQueue('link_clicks', event);
      }

      addToQueue('clicks', event);
    });
  } else if (events.clicks) {
    document.addEventListener('click', function(event) {
      addToQueue('clicks', event);
    });
  } else if (events.linkClicks) {
    document.addEventListener('click', function(event) {
      if (event.target.tagName === 'A') {
        addToQueue('link_clicks', event);
      }
    });
  }

  if (events.mousemoves) {
    document.addEventListener('mousemove', (event) => {
      mousePos = {
        x: event.clientX,
        y: event.clientY,
      }
    });

    setInterval(() => {
      const pos = mousePos;

      if (pos) {
        if (!prevMousePos || prevMousePos && pos !== prevMousePos) {

          addToQueue('mouse_moves', pos);

          prevMousePos = pos;
        }
      }
    }, 100);
  }

  if (events.keypress) {
    document.addEventListener('keypress', (event) => {
      addToQueue('key_presses', event);
    });
  }

  if (events.formSubmits) {
    document.addEventListener('submit', (event) => {
      addToQueue('form_submissions', event);
    });
  }
});
