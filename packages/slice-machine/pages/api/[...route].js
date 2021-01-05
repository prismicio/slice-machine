const baseServer = 'http://localhost:9999'

export default async function handler(req, res) {
  return fetch(`${baseServer}${req.url}`, {
    method: req.method,
    headers: req.headers,
    ...(req.method === 'POST' ? {
      body: req.body
    } : {})
  }).then(async response => {
    const payload = await response.json()
    res.status(response.status || 200).json(payload)
  }).catch(async err => {
    console.error(`[slicemachine-dev] Error at route "${req.url}": ${err}`)
    res.status(err.status || 400).json(err)
  })
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '64mb',
    },
  },
}