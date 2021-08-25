const axios = require("axios");

const slackURL = process.env.SLACK_URL;

async function do_check(i) {
  return axios
    .request("https://api.doppler.com/_/health/router", {
      headers: {
        "User-Agent": "Doppler Bot",
        "Accept": "application/json, text/plain, */*",
      },
      timeout: 10000,
    })
    .then(() => {
      console.log(new Date(), `(${i}) OK`)
    })
    .catch(error => {
      console.error(i, error)
      slack(`Healthcheck error: ${error}`)
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
    await do_check(0);
    await delay(1000);
  }
}

main().catch(e => console.error(e))
