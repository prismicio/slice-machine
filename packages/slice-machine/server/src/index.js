/// <reference path="../../../sm-commons/index.d.ts" />

require("@babel/register");

console.log('\nLaunching server...')

import os from 'os'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import serveStatic from 'serve-static'
import formData from 'express-form-data'

global.fetch = require('node-fetch')
global.appRoot = path.join(__dirname, '../../../')

const api = require('./api')

const app = express()
app.use(bodyParser.json({ limit: '64mb', extended: true }))

const out = path.join(__dirname, '../../..', 'out')

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

app.use('/warnings', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'warnings.html'));
})

app.use('/:lib/:sliceName/:variation', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, '[lib]/[sliceName]/[variation].html'));
})

app.use('/:cts/:id', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'cts/[ct].html'));
})

app.use('/slices', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'slices.html'));
})

app.use('/onboarding', async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, 'onboarding.html'));
})


app.listen(process.env.PORT, () => {
  const p = `http://localhost:${process.env.PORT}`
  console.log(`p=${p}`)
});

process.on('SIGINT', () => { console.log("\nServer killed manually. Exiting..."); process.exit(); });
