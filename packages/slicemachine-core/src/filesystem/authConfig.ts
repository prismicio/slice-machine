import { Files, cookie } from "../utils";
import { PrismicConfigPath } from "./paths";

export interface AuthConfig {
  base: string;
  cookies: string;
  oauthAccessToken?: string;
  authUrl?: string;
}

const DEFAULT_CONFIG: AuthConfig = { base: "https://prismic.io", cookies: "" };

/**
 * A function that creates a default config
 * @param {string} [configPath] - the path to the configuration file
 * @returns {Config} - the default config.
 */
export function createDefaultAuthConfig(directory?: string): AuthConfig {
  const configPath = PrismicConfigPath(directory);
  Files.write(configPath, JSON.stringify(DEFAULT_CONFIG, null, "\t"), {
    recursive: false,
  });
  return DEFAULT_CONFIG;
}

/**
 * A function that retrieve the configuration file or create it if it doesn't exist.
 * @param {string} [configPath] - the path to the configuration file
 * @returns {Config} - the config object.
 */
export function getOrCreateAuthConfig(directory?: string): AuthConfig {
  const configPath = PrismicConfigPath(directory);
  if (!Files.exists(configPath)) return createDefaultAuthConfig(directory);

  const conf = Files.readJson(configPath);
  const completeConf: AuthConfig = { ...DEFAULT_CONFIG, ...conf };
  return completeConf;
}

/**
 * A function that update the configuration file
 * @param {string} [configPath] - the path to the configuration file
 * @param {Partial<Config>} [data] - configuration attributes to change
 * @returns {void} nothing
 */
export function updateAuthConfig(
  data: Partial<AuthConfig>,
  directory?: string
): void {
  const configPath = PrismicConfigPath(directory);
  const oldConfig = getOrCreateAuthConfig(directory);

  return Files.write(
    configPath,
    { ...oldConfig, ...data },
    { recursive: false }
  );
}

/**
 * A function that creates a default config
 * @param {string} [configPath] - the path to the configuration file
 * @returns {void} nothing
 */
export function removeAuthConfig(directory?: string): void {
  const configPath = PrismicConfigPath(directory);
  return Files.remove(configPath);
}

/**
 * A function to update the config cookies
 * @param {string} [base] - the base for which the cookies are valid
 * @param {string} [cookies] - the list of new cookies
 * @returns {void} nothing
 */
export function setAuthConfig(
  base: string,
  cookies: ReadonlyArray<string> = [],
  directory?: string
): void {
  const { cookies: currentCookies } = getOrCreateAuthConfig(directory);
  const mergedCookie = mergeCookies(cookies, currentCookies);

  return updateAuthConfig({ base, cookies: mergedCookie });
}

export function setAuthConfigCookies(
  cookies: ReadonlyArray<string> = [],
  directory?: string
): void {
  const { base } = getOrCreateAuthConfig(directory);

  const newCookiesMap = cookies
    .map((str) => cookie.parse(str))
    .reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

  const newCookies = Object.entries(newCookiesMap)
    .map(([key, value]) => {
      return cookie.serialize(key, value);
    })
    .join("; ");

  return updateAuthConfig({ base, cookies: newCookies });
}

function mergeCookies(
  newCookies: ReadonlyArray<string>,
  currentCookies: string
) {
  const oldCookiesMap = cookie.parse(currentCookies || "");

  const newCookiesMap = newCookies
    .map((str) => cookie.parse(str))
    .reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

  return Object.entries({ ...oldCookiesMap, ...newCookiesMap })
    .map(([key, value]) => {
      return cookie.serialize(key, value);
    })
    .join("; ");
}
