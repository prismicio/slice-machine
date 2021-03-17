/// <reference path="../../../sm-commons/index.d.ts" />

require("@babel/register");
global.fetch = require("node-fetch");

console.log('Launching server')

import os from 'os'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import serveStatic from 'serve-static'
import formData from 'express-form-data'

const api = require('./api')

const app = express()
app.use(bodyParser.json({ limit: '64mb', extended: true }))

const out = path.join(__dirname, '..', 'out')

const formDataOptions = {
  uploadDir: os.tmpdir()
}

app.use(formData.parse(formDataOptions))
app.use(serveStatic(out))

app.use('/api', api)

app.use('/migration', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'migration.html'));
})

app.use('/changelog', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'changelog.html'));
})

app.use('/:lib/:sliceName/:variation', async function sliceRoute(_, res) {
  console.log('hello')
  return res.sendFile(path.join(out, '[lib]/[sliceName]/[variation].html'));
})

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Now running on http://localhost:${port} !`));

process.on('SIGINT', () => { console.log("\nServer killed manually. Exiting..."); process.exit(); });
