import { getOrElseW } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { Files, Cookie } from "../utils";
import { PrismicConfigPath } from "./paths";

export const AuthConfig = t.intersection([
  t.type({
    base: t.string,
    cookies: t.string
  }),
  t.partial({
    oauthAccessToken: t.string,
    authUrl: t.string
  })
]);
export type AuthConfig = t.TypeOf<typeof AuthConfig>

const DEFAULT_CONFIG: AuthConfig = { base: "https://prismic.io", cookies: "" };

export function createDefaultAuthConfig(directory?: string): AuthConfig {
  const configPath = PrismicConfigPath(directory);
  Files.write(configPath, JSON.stringify(DEFAULT_CONFIG, null, "\t"), {
    recursive: false,
  });
  return DEFAULT_CONFIG;
}

export function getOrCreateAuthConfig(directory?: string): AuthConfig {
  const configPath = PrismicConfigPath(directory);
  if (!Files.exists(configPath)) return createDefaultAuthConfig(directory);

  const conf = Files.safeReadEntity(configPath, (payload: any) => {
    return getOrElseW(() => null)(AuthConfig.decode(payload))
  });
  return { ...DEFAULT_CONFIG, ...conf } as AuthConfig;
}

export function removeAuthConfig(directory?: string): void {
  const configPath = PrismicConfigPath(directory);
  return Files.remove(configPath);
}

export function setAuthConfig(
  cookies: ReadonlyArray<string> = [],
  base?: string,
  directory?: string
): void {
  const currentConfig = getOrCreateAuthConfig(directory);
  const formattedCookies = Cookie.serializeCookies(cookies);
  const configPath = PrismicConfigPath(directory);

  const newConfig = {
    cookies: formattedCookies,
    base: base || currentConfig.base,
  };

  return Files.write(
    configPath,
    { ...currentConfig, ...newConfig },
    { recursive: false }
  );
}
