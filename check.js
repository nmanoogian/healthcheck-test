const axios = require("axios");

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
    });
}

async function delay(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

async function main() {
  while (true) {
    await do_check(0);
    await delay(1000);
  }
}

main().catch(e => console.error(e))
