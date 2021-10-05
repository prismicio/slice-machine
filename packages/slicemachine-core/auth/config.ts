import Files from '../utils/files'

export interface Config {
  base: string;
  cookies: string;
  oauthAccessToken?: string;
  authUrl?: string;
}

const DEFAULT_CONFIG: Config = {base: 'https://prismic.io', cookies: ''}

/**
  * A function that creates a default config
  * @param {string} [configPath] - the path to the configuration file
  * @returns {Config} - the default config.
*/
function createDefaultConfig(configPath: string): Config {
  Files.write(configPath, JSON.stringify(DEFAULT_CONFIG, null, '\t'))
  return DEFAULT_CONFIG
}

/**
  * A function that retrieve the configuration file or create it if it doesn't exist.
  * @param {string} [configPath] - the path to the configuration file
  * @returns {Config} - the config object.
*/
function getOrCreateConfig(configPath: string): Config {
  if (!Files.exists(configPath)) return createDefaultConfig(configPath)
  
  const conf = Files.readJson(configPath)
  const completeConf: Config = { ...DEFAULT_CONFIG, ...conf }
  return completeConf
}

/**
  * A function that update the configuration file
  * @param {string} [configPath] - the path to the configuration file
  * @param {Partial<Config>} [data] - configuration attributes to change
  * @returns {void} nothing
*/
function updateConfig(configPath: string, data: Partial<Config>): void {
  const oldConfig = getOrCreateConfig(configPath)

  return Files.write(configPath, { ...oldConfig, ...data })
}

/**
  * A function that creates a default config
  * @param {string} [configPath] - the path to the configuration file
  * @returns {void} nothing
*/
function removeConfig(configPath: string): void {
  return Files.remove(configPath)
}

export const Config = {
  createDefaultConfig,
  getOrCreateConfig,
  updateConfig,
  removeConfig
}