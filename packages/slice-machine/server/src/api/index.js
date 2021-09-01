const express = require('express')
const router = express.Router()

const fs = require('fs')
const mime = require('mime')
const base64Img = require('base64-img')

const push = require('./slices/push').default
const save = require('./slices/save').default
const createSlice = require('./slices/create/index').default

const pushAll = require('./push-all').default

const screenshot = require('./screenshot').default
const customScreenshot = require('./custom-screenshot').default
const parseOembed = require('./parse-oembed').default
const state = require('./state').default
const pushLibs = require('./libraries/push').default

const saveCT = require('./custom-types/save').default
const pushCustomType = require('./custom-types/push').default

import validateAuth from './auth/validate'

router.use('/__preview', async function previewRoute(req, res) {
  const p = decodeURIComponent(req.query.q)
  const stream = fs.createReadStream(p)
  const type = mime.getType(p.split('.').pop())
  stream.on('open', function () {
    res.set('Content-Type', type)
    stream.pipe(res)
  })
  return stream.on('error', function (e) {
    console.log('[slice-machine] Preview error: ', e)
    res.set('Content-Type', 'application/json')
    res.status(404).send({})
  })
})

router.use('/state', async function (req, res) {
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

router.use('/parse-oembed', async function (req, res) {
  const payload = await parseOembed(req.body.url)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/push-all', async function (req, res) {
  const payload = await pushAll()
  return res.status(200).json(payload)
})

router.use('/libraries/push', async function (req, res) {
  const payload = await pushLibs(req.query)
  return res.status(200).json(payload)
})

router.use('/slices/save', async function (req, res) {
  const payload = await save(req)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})
router.use('/slices/create', async function (req, res) {
  let payload
  if (req.method === 'POST') {
    payload = await createSlice(req.body)
  } else {
    payload = await createSlice(req.query)
  }

  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/slices/push', async function (req, res) {
  const payload = await push(req.query)
  if (payload.err) {
    return res.status(payload.status).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/custom-types/save', async function (req, res) {
  const payload = await saveCT(req)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/custom-types/push', async function (req, res) {
  const payload = await pushCustomType(req.query)
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('/auth/validate', async function (req, res) {
  const payload = await validateAuth()
  if (payload.err) {
    return res.status(400).json(payload)
  }
  return res.status(200).json(payload)
})

router.use('*', async function (req, res) {
  return res.status(404).json({ err: 'not-found', reason: `Could not find route "${req.baseUrl}"`})
})

module.exports = router