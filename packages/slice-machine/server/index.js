require("@babel/register");
global.fetch = require("node-fetch");

console.log('Launching server')


import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import serveStatic from 'serve-static'

const api = require('./api')

const app = express()
app.use(bodyParser.json())

const out = path.join(__dirname, '..', 'out')

app.use(serveStatic(out))

app.use('/api', api)

app.use('/migration', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'migration.html'));
})

app.use('/changelog', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'changelog.html'));
})

app.use('/:lib/:sliceName', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, '[lib]/[sliceName].html'));
})

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Now running on http://localhost:${port} !`));

process.on('SIGINT', () => { console.log("\nServer killed manually. Exiting..."); process.exit(); });
