import 'whatwg-fetch';

const sendData = (url, buffer) => {
  if (process.env['errorHandling']) {
    fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      mode: "cors",
      body: buffer,
    })
    .then(response => response.json())
    .then(json => console.log(json))
    .catch(error => console.log(error));
  } else {
    navigator.sendBeacon(url, buffer);
  }
}

module.exports = sendData;
