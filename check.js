const axios = require("axios");
const { DnsPolling, HttpsAgent } = require("@shuhei/pollen");
const { request } = require('undici');
const { serializeError } = require('serialize-error');

const version = "VERSION_PLACEHOLDER";
const slackURL = process.env.SLACK_URL;
const verbose = process.env.LOGGING === "debug";

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
    .catch(error => {
      console.error("axios error", JSON.stringify(serializeError(error)))
      slack(`Healthcheck axios error ${url}: ${error}`)
    });
}

async function do_undici(url) {
  request(url)
    .then(() => {
      if (verbose) {
        console.log(new Date(), `${url} undici OK`)
      }
    })
    .catch(error => {
      console.error("undici error", JSON.stringify(serializeError(error)))
      slack(`Healthcheck undici error ${url}: ${error}`)
    });
}

async function delay(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

async function slack(message) {
  if (slackURL == null) {
    return;
  }
  return axios.request(slackURL, {
    method: "post",
    data: { text: message }
  });
}

async function main() {
  console.log(`starting ${version}`);
  await slack(`polling started ${version}`);

  const dnsPolling = new DnsPolling({
    interval: 1 * 1000
  });

  if (verbose) {
    dnsPolling.on("resolve:success", info => {
      console.log("DNS success", info);
    });
  }
  dnsPolling.on("resolve:error", info => {
    console.log("DNS error", info);
  });

  dnsPolling.getLookup("staging-api.doppler.com")

  while (true) {
    await Promise.all([
      "https://cli.staging.doppler.com/install.sh",
      "https://staging-api.doppler.com/_/health/router",
      "https://staging-api.doppler.com",
      "https://google.com",
      ].map(url => [do_undici(url), do_check(url)]).flat()
    );
    await delay(1000);
  }
}
main().catch(e => console.error(e))
