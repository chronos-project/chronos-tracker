(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// this uuidv4 snippet was found on SO and is exactly the same as used in Keen's tracker
// for Node and older browsers. i'm assuming it is fine to use CnP, then. Just updated it
// to use ES6

if (!window.sessionStorage.getItem('uuid')) {
  const generateUuidv4 = (() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  })();

  window.sessionStorage.setItem('uuid', generateUuidv4);
}

const uuidv4 = window.sessionStorage.getItem('uuid');

const getUserAgent = (usrAgentString) => {
  let sBrowser = 'unknown';
  let sUsrAg = usrAgentString;

  //The order matters here, and this may report false positives for unlisted browsers.

  if (sUsrAg.indexOf("Firefox") > -1) {
       sBrowser = "Mozilla Firefox";
       //"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
  } else if (sUsrAg.indexOf("Opera") > -1) {
       sBrowser = "Opera";
  } else if (sUsrAg.indexOf("Trident") > -1) {
       sBrowser = "Microsoft Internet Explorer";
       //"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
  } else if (sUsrAg.indexOf("Edge") > -1) {
       sBrowser = "Microsoft Edge";
       //"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
  } else if (sUsrAg.indexOf("Chrome") > -1) {
      sBrowser = "Google Chrome or Chromium";
      //"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
  } else if (sUsrAg.indexOf("Safari") > -1) {
      sBrowser = "Apple Safari";
      //"Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
  }

  return sBrowser;
}

const appendMetadataToEvents = (events) => {
  return {
    events,
    metadata: {
      url: window.location.href,
      userAgent: getUserAgent(navigator.userAgent),
      pageTitle: document.title,
      cookieAllowed: navigator.cookieEnabled,
      language: navigator.language,
      uuid: uuidv4,
    },
  };
};

module.exports = {
  getUserAgent,
  appendMetadataToEvents,
}

},{}],2:[function(require,module,exports){
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

},{"./metadata":1,"./sendData":3}],3:[function(require,module,exports){
const sendData = (url, json) => {
  if (true) {
    fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: json,
    })
    .then(response => response.json())
    .then(json => console.log(json))
    .catch(error => console.log(error));
  } else {
    navigator.sendBeacon(url, json);
  }
}

module.exports = sendData;

},{}],4:[function(require,module,exports){
const createQueue = require('./queue');
const queue = createQueue(50);

const getEventData = (eType, e) => {
  const timestamp = Date.now(); // NEEDS TO REFLECT CLIENT TIME -- must fix

  switch (eType) {
    case 'link_clicks':
      return {
        eType,
        linkText: e.target.firstChild.textContent,
        targetURL: e.target.href,
        timestamp,
      };
      break;
    case 'clicks':
      return {
        eType,
        target_node: e.target.nodeName,
        buttons: e.buttons,
        x: e.clientX,
        y: e.clientY,
        timestamp,
      };
    case 'mouse_moves':
      return {
        eType,
        x: e.x,
        y: e.y,
        timestamp,
      };
    case 'key_press':
      return {
        eType,
        key: e.key,
        timestamp,
      };
    case 'form_submission':
      const inputs = [...e.target.elements].filter(e => e.tagName === 'INPUT');
      const data = {
        eType,
      };

      inputs.forEach(input => data[input.name] = input.value);

      return data;
    case 'pageview': {
      return {
        eType,
        url: window.location.href,
        title: document.title,
        timestamp,
      };
    }
    default:
      return {};
  }
}

const addToQueue = (eType, e) => {
  queue.add(getEventData(eType, e));
}

document.addEventListener('DOMContentLoaded', function(event) {
  let mousePos;
  let prevMousePos;

  const events = {"linkClicks":true,"clicks":true,"pageviews":true,"mousemoves":false,"formSubmits":true,"keypress":true};

  document.addEventListener('beforeunload', event => {
    queue.flush();
  });

  if (events.pageviews) {
    (() => {
      addToQueue('pageview');
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
      addToQueue('key_press', event);
    });
  }

  if (events.formSubmits) {
    document.addEventListener('submit', (event) => {
      addToQueue('form_submission', event);
    });
  }
});

},{"./queue":2}]},{},[4]);
