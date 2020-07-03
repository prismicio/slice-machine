import fs from 'fs'
import path from 'path'
import formidable from 'formidable-serverless';
import getConfig from 'next/config'

export const config = {
  api: {
    bodyParser: false,
  },
};

const { publicRuntimeConfig } = getConfig();


async function parse(req) {
  return new Promise((resolve) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = "./";
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      const componentInfo = JSON.parse(fields.componentInfo);
      const { pathToSlice, sliceName } = componentInfo
      const pathToPreview = path.join(publicRuntimeConfig.cwd, pathToSlice, sliceName, 'preview.png')
      console.log({ pathToPreview, files })
      resolve({
        componentInfo,
        pathToPreview,
        file: files.file
      })
    });
  })
}

export default async (req, res) => {
  const { pathToPreview, file } = await parse(req)
  return res.status(200).send({ hello: true });
};