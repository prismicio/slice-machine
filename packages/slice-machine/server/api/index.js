const express = require('express')
const router = express.Router()

const fs = require('fs')
const mime = require('mime')
const base64Img = require('base64-img')

const push = require('./push').default
const pushAll = require('./push-all').default
const update = require('./update').default
const screenshot = require('./screenshot').default
const customScreenshot = require('./custom-screenshot').default
const parseOembed = require('./parse-oembed').default
const state = require('./state').default

router.use('/__preview', async function previewRoute(req, res) {
  console.log('new preview')
  const p = decodeURIComponent(req.query.q)
  const stream = fs.createReadStream(p)
  const type = mime.getType(p.split('.').pop())
  stream.on('open', function () {
    res.set('Content-Type', type)
    stream.pipe(res)
  })
  stream.on('error', function (e) {
    console.log('error', e)
    res.set('Content-Type', 'application/json')
    res.status(404).send({})
  })
  return
  // const plain = decodeURIComponent(req.query.plain) != 'undefined' ? true : false
  // if (plain) {
  //   const stream = fs.createReadStream(p)
  //   const type = mime.getType(p.split('.').pop())
  //   stream.on('open', function () {
  //     res.set('Content-Type', type)
  //     stream.pipe(res)
  //   })
  //   stream.on('error', function (e) {
  //     console.log('error', e)
  //     res.set('Content-Type', 'application/json')
  //     res.status(404).send({})
  //   })
  //   return
  // }
  // try {
  //   const base = base64Img.base64Sync(p)
  //   res.set('Content-Type', 'application/json')
  //   res.status(200).json({ base })
  // } catch(e) {
  //   res.status(404).json({ base: null })
  // }
})

router.use('/state', async function (req, res) {
  console.log('reftech all')
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
  const payload = await customScreenshot(req.files.file, req.body)
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

router.use('/parse-oembed', async function (req, res) {
  const payload = await parseOembed(req.body.url)
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

router.use('/push-all', async function (req, res) {
  const payload = await pushAll()
  return res.status(200).json(payload)
})

router.use('*', async function (req, res) {
  return res.status(404).json({ err: 'not-found', reason: `Could not find route "${req.baseUrl}"`})
})

module.exports = router