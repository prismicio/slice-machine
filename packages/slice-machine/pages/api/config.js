import { getConfig } from 'lib/config'

export const handler = async(req, res) => {
  const userConfig = getConfig()
  return res.status(200).send(userConfig)
}