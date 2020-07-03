import getConfig from "next/config";

import { listComponentsByLibrary } from '../../lib/listComponents'

const { publicRuntimeConfig: config } = getConfig()

export default async function handler(req, res) {
  const libraries = await listComponentsByLibrary(config.libraries);
  return res.status(200).json(libraries);
}