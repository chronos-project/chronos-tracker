const sendData = (url, json) => {
  if (process.env['errorHandling']) {
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
    // const blob = new Blob([json], {type: 'application/json; charset=utf-8'});
    navigator.sendBeacon(url, json);
  }
}

module.exports = sendData;
