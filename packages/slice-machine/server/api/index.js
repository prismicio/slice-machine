const express = require('express')
const router = express.Router()

const push = require('./push').default
const update = require('./update').default
const screenshot = require('./screenshot').default
const customScreenshot = require('./custom-screenshot').default
const state = require('./state').default

router.use('/state', async function (_, res) {
  const payload = await state()
  if (payload.clientError) {
    return res.status(payload.clientError.status).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/screenshot', async function (req, res) {
  const payload = await screenshot(req.query)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/custom-screenshot', async function (req, res) {
  const payload = await customScreenshot(req.body)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/update', async function (req, res) {
  const payload = await update(req)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/push', async function (req, res) {
  const payload = await push(req.query)
  if (payload.err) {
    return res.status(payload.status).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('*', async function (req, res) {
  return res.status(404).json({ err: 'not-found', reason: `Could not find route "${req.baseUrl}"`})
})

module.exports = router