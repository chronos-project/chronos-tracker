![chronos-logo](https://i.imgur.com/yWR0afJ.png)

[![chronos](https://img.shields.io/badge/chronos-%F0%9F%95%B0-blue.svg)](https://chronos-project.github.io)
![chronos version](https://img.shields.io/badge/version-0.9.0--beta-orange.svg)
![license](https://img.shields.io/badge/license-MIT-green.svg)
## Overview
Chronos is an event-capturing framework for greenfield applications and is built with NodeJS, Apache Kafka, TimescaleDB, and PipelineDB. This repository contians the tracker file which captures events on the client side and sends them to the data pipeline. You can read about our story of creating Chronos [here](https://chronos-project.github.io/casestudy.html).

## Installation
To build the tracker file you must have [NodeJS](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your machine. Inside the root directory of the repository there is a `config.json` file. The properties are as follows:

Property | Value Type | Description
--- | --- | ---
`queueSize` | Number (Integer) | Determines the maximum number of events that the buffer holds
`errorHandling` | Boolean | Detemines whether or not to handle errors on the client side. Will use the [BeaconAPI](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) if `false`, [FetchAPI](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) if `true`
`linkClicks` | Boolean | Determines whether or not to capture link click events
`clicks` | Boolean | Determines whether or not to capture mouse click events
`pageviews` | Boolean | Determines whether or not to capture pageview events
`mousemoves` | Boolean | Determines whether or not to capture mouse movement events
`formSubmits` | Boolean | Determines whether or not to capture form submission events
`keypress` | Boolean | Determines whether or not to capture key press events

We recommend using the defaults. Once the `config.json` file is set, go to the `queue.js` file in the `src` directory. On line 3, you must change the `API_URL` variable so that it points to your API server. Further, on line 26, make sure the value of the `ACCESS_KEY` property matches that on your API server as well.

Once this is done, from the root directory first install the dependencies and then run `npm run build`. The compiled `tracker.js` file will be in the `javascripts` directory. At this point just import the file into any pages that you need to track data, and events will automatically be captured and sent to the server!

## The Team
[**Nick Calibey**](https://ncalibey.github.io/) _Software Engineer_ Tulsa, OK

[**Sasha Prodan**](https://sashaprodan.github.io/) _Software Engineer_ San Francisco, CA
