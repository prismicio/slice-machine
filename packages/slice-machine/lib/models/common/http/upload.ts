import fs from 'fs'
import FormData from 'form-data'
import mime from 'mime'

function upload(
  { url, fields, key, filename, pathToFile }:
  { url: string, fields: { [key: string]: string}, key: string, filename: string, pathToFile: string }
): Promise<any> {

  const fileExtension = filename.split('.').pop()

  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    form.append(key, value)
  })
  form.append('key', key)
  form.append('Content-Type', fileExtension && mime.getType(fileExtension))
  form.append('file', fs.createReadStream(pathToFile), {
    filename,
    contentType: undefined,
    knownLength: fs.statSync(pathToFile).size,
  })
  return new Promise((resolve) => {
    form.submit(url, function(_, res) {
      resolve(res.statusCode)
    })
  })
}

export default upload