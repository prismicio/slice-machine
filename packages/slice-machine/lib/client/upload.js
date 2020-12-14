import fs from 'fs'
import FormData from 'form-data'
import mime from 'mime'

function upload({ url, fields, key, filename, pathToFile }) {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    form.append(key, value)
  })
  form.append('key', key)
  form.append('Content-Type', mime.getType(filename.split('.').pop()))
  form.append('file', fs.createReadStream(pathToFile), {
    filename,
    contentType: null,
    knownLength: fs.statSync(pathToFile).size,
  })
  return new Promise((resolve) => {
    form.submit(url, function(_, res) {
      resolve(res.statusCode)
    })
  })
}

export default upload