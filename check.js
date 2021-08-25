const axios = require("axios");
const { DnsPolling, HttpsAgent } = require("@shuhei/pollen");
const { request } = require('undici');

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
      console.error("axios error", error)
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
      console.error("undici error", error)
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
      do_check("https://staging-api.doppler.com/_/health/router"),
      do_check("https://staging-api.doppler.com"),
      do_undici("https://staging-api.doppler.com/_/health/router"),
      do_undici("https://staging-api.doppler.com"),
    ]);
    await delay(1000);
  }
}
main().catch(e => console.error(e))
