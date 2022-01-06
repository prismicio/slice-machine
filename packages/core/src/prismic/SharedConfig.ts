import { getOrElseW } from "fp-ts/lib/Either";

import { parse, serializeCookie, serializeCookies } from "../auth/cookie";
import { parsePrismicAuthToken } from "./cookie";
import { AUTH_KEY } from "../defaults";

import { PrismicConfigPath } from "../fs-utils/paths";
import { PrismicSharedConfig } from "../models/PrismicSharedConfig";

import { Files } from "../internals";

export const DEFAULT_CONFIG: PrismicSharedConfig = {
  base: "https://prismic.io",
  cookies: "",
};

export const SharedConfigManager = {
  default(): PrismicSharedConfig {
    Files.write(PrismicConfigPath, JSON.stringify(DEFAULT_CONFIG, null, "\t"), {
      recursive: false,
    });
    return DEFAULT_CONFIG;
  },

  get: (): PrismicSharedConfig => {
    if (!Files.exists(PrismicConfigPath)) return SharedConfigManager.default();

    const conf = Files.safeReadEntity<PrismicSharedConfig>(
      PrismicConfigPath,
      (payload) => {
        return getOrElseW(() => null)(PrismicSharedConfig.decode(payload));
      }
    );
    return { ...DEFAULT_CONFIG, ...conf } as PrismicSharedConfig;
  },

  getAuth(): string {
    const config = SharedConfigManager.get();
    return parsePrismicAuthToken(config.cookies);
  },

  set(config: PrismicSharedConfig): void {
    Files.write(PrismicConfigPath, config, { recursive: false });
  },

  setProperties(
    props: Partial<PrismicSharedConfig>,
    baseConfig?: PrismicSharedConfig
  ): void {
    const config = baseConfig || SharedConfigManager.get();

    const updated = { ...config, ...props };
    SharedConfigManager.set(updated);
  },

  setCookie(cookie: { [key: string]: string }): void {
    const config = SharedConfigManager.get();
    const cookiesMap = parse(config.cookies);

    const updatedCookiesMap = { ...cookiesMap, ...cookie };

    const serializedCookies = serializeCookies(
      Object.entries(updatedCookiesMap).map(([k, v]) => serializeCookie(k, v))
    );

    SharedConfigManager.setProperties({ cookies: serializedCookies }, config);
  },

  setAuthCookie(authToken: string): void {
    SharedConfigManager.setCookie({ [AUTH_KEY]: authToken });
  },

  remove(): void {
    return Files.remove(PrismicConfigPath);
  },

  reset(): void {
    return SharedConfigManager.set(DEFAULT_CONFIG);
  },
};
