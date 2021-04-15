const axios = require("axios");

function do_check() {
  axios
    .request("https://api.doppler.com/_/health/router", {
      headers: {
        "User-Agent": "Doppler Bot",
        "Accept": "application/json, text/plain, */*",
      },
      timeout: 10000,
    })
    .then(() => {
      console.log(new Date(), "OK")
    })
    .catch(error => {
      console.error(error)
    });
}

setInterval(do_check, 5000);
