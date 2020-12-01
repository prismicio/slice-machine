import fs from 'fs'
import fetch from 'node-fetch'

async function upload({ url, fields, key, filename }) {
  const options = {
    method: 'POST',
    url,
    formData: {
      ...fields,
      key,
      file: {
        value: fs.createReadStream(FP),
        options: {
          filename,
          contentType: null
        }
      }
    },
    headers: {},
  }
  return fetch(options)
}

export default upload