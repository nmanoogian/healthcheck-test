const express = require("express");
const { getLogs, checkMain } = require("./check")

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(getLogs().map(l => `${l}`).join("\n"))
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

checkMain().catch(e => console.error(e))
