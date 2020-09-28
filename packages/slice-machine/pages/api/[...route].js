const baseServer = 'http://localhost:9999'

export default async function handler(req, res) {
  return fetch(`${baseServer}${req.url}`, {
    method:req.method,
    ...(req.method === 'POST' ? {
      body: JSON.stringify(req.body)
    } : {})
  }).then(async response => {
    const payload = await response.json()
    console.log({ response, payload })
    res.status(response.status).json(payload)
  }).catch(async err => {
    console.log({ err })
    res.status(err.status).json(err)
  })
}