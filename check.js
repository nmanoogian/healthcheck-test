const axios = require("axios");
const { DnsPolling } = require("@shuhei/pollen");
const { request } = require('undici');
const { serializeError } = require('serialize-error');

const slackURL = process.env.SLACK_URL;
const verbose = process.env.LOGGING === "debug";

let logs = [];

async function log(message) {
  logs.unshift(`${new Date().toISOString()} :: ${message}`);
  logs = logs.slice(0, 100);

  if (slackURL != null) {
    return axios.request(slackURL, {
      method: "post",
      data: { text: message }
    });
  }
}

async function do_check(url) {
  return axios
    .request(url, {
      headers: {
        "User-Agent": "Doppler Bot",
        "Accept": "application/json, text/plain, */*",
      },
      timeout: 10000,
    })
    .then(() => {
      if (verbose) {
        console.log(new Date(), `${url} axios OK`)
      }
    })
    .catch(async (error) => {
      console.error("axios error", JSON.stringify(serializeError(error)))
      await log(`Healthcheck axios error ${url}: ${error}`)
    });
}

async function do_undici(url) {
  request(url)
    .then(() => {
      if (verbose) {
        console.log(new Date(), `${url} undici OK`)
      }
    })
    .catch(async (error) => {
      console.error("undici error", JSON.stringify(serializeError(error)))
      await log(`Healthcheck undici error ${url}: ${error}`)
    });
}

async function delay(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

async function checkMain() {
  console.log(`starting poller`);
  await log(`polling started`);

  const dnsPolling = new DnsPolling({
    interval: 1 * 1000
  });

  if (verbose) {
    dnsPolling.on("resolve:success", info => {
      console.log("DNS success", info);
    });
  }
  dnsPolling.on("resolve:error", async (info) => {
    console.log("DNS error", info);
    await log(`DNS error: ${info}`);
  });

  dnsPolling.getLookup("staging-api.doppler.com")

  while (true) {
    await Promise.all([
      // Production
      "https://cli.doppler.com/install.sh",
      "https://api.doppler.com/_/health/router",
      "https://api.doppler.com",
      // Staging
      "https://cli.staging.doppler.com/install.sh",
      "https://staging-api.doppler.com/_/health/router",
      "https://staging-api.doppler.com",
      // Sanity Check
      "https://google.com",
      ].map(url => [do_undici(url), do_check(url)]).flat()
    );
    await delay(1000);
  }
}

module.exports = { checkMain, logs };
