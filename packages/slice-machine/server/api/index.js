const express = require('express')
const router = express.Router()

const migrate = require('./migrate').default
const update = require('./update').default
const getLibraries = require('./libraries').default

router.use('/libraries', async function (_, res) {
  const payload = await getLibraries()
  return res.status(200).json(payload)
})

router.use('/migrate', async function (_, res) {
  const payload = await migrate()
  return res.status(200).json(payload)
})

router.use('/update', async function (req, res) {
  const payload = await update(req)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

module.exports = router