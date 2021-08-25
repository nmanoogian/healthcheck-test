const axios = require("axios");

const slackURL = process.env.SLACK_URL;

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
      console.log(new Date(), `${url} OK`)
    })
    .catch(error => {
      console.error(error)
      slack(`Healthcheck error ${url}: ${error}`)
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
  await slack("polling started");
  while (true) {
    await do_check("https://api.doppler.com/_/health/router");
    await delay(1000);
    await do_check("https://api.doppler.com");
    await delay(1000);
  }
}

main().catch(e => console.error(e))
