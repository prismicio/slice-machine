import Files from '../../utils/files'

export interface AuthConfig {
  base: string;
  cookies: string;
  oauthAccessToken?: string;
  authUrl?: string;
}

const DEFAULT_CONFIG: AuthConfig = {base: 'https://prismic.io', cookies: ''}

/**
  * A function that creates a default config
  * @param {string} [configPath] - the path to the configuration file
  * @returns {Config} - the default config.
*/
function createDefaultConfig(configPath: string): AuthConfig {
  Files.write(configPath, JSON.stringify(DEFAULT_CONFIG, null, '\t'))
  return DEFAULT_CONFIG
}

/**
  * A function that retrieve the configuration file or create it if it doesn't exist.
  * @param {string} [configPath] - the path to the configuration file
  * @returns {Config} - the config object.
*/
function getOrCreateConfig(configPath: string): AuthConfig {
  if (!Files.exists(configPath)) return createDefaultConfig(configPath)
  
  const conf = Files.readJson(configPath)
  const completeConf: AuthConfig = { ...DEFAULT_CONFIG, ...conf }
  return completeConf
}

/**
  * A function that update the configuration file
  * @param {string} [configPath] - the path to the configuration file
  * @param {Partial<Config>} [data] - configuration attributes to change
  * @returns {void} nothing
*/
function updateConfig(configPath: string, data: Partial<AuthConfig>): void {
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