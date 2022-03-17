import { getOrElseW } from "fp-ts/lib/Either";
import { Files, Cookie } from "../utils";
import { PrismicConfigPath } from "./paths";
import { PrismicSharedConfig } from "../models/PrismicSharedConfig";

export const DEFAULT_CONFIG: PrismicSharedConfig = {
  base: "https://prismic.io",
  cookies: "",
};

export const PrismicSharedConfigManager = {
  default(): PrismicSharedConfig {
    Files.write(PrismicConfigPath, JSON.stringify(DEFAULT_CONFIG, null, "\t"), {
      recursive: false,
    });
    return DEFAULT_CONFIG;
  },

  get: (): PrismicSharedConfig => {
    if (!Files.exists(PrismicConfigPath))
      return PrismicSharedConfigManager.default();

    const conf = Files.safeReadEntity<PrismicSharedConfig>(
      PrismicConfigPath,
      (payload) => {
        return getOrElseW(() => null)(PrismicSharedConfig.decode(payload));
      }
    );
    return { ...DEFAULT_CONFIG, ...conf } as PrismicSharedConfig;
  },

  getAuth(): string {
    const config = PrismicSharedConfigManager.get();
    return Cookie.parsePrismicAuthToken(config.cookies);
  },

  set(config: PrismicSharedConfig): void {
    Files.write(PrismicConfigPath, config, { recursive: false });
  },

  setProperties(
    props: Partial<PrismicSharedConfig>,
    baseConfig?: PrismicSharedConfig
  ): void {
    const config = baseConfig || PrismicSharedConfigManager.get();

    const updated = { ...config, ...props };
    PrismicSharedConfigManager.set(updated);
  },

  setCookie(cookie: { [key: string]: string }): void {
    const config = PrismicSharedConfigManager.get();
    const cookiesMap = Cookie.parse(config.cookies);

    const updatedCookiesMap = { ...cookiesMap, ...cookie };

    const serializedCookies = Cookie.serializeCookies(
      Object.entries(updatedCookiesMap).map(([k, v]) =>
        Cookie.serializeCookie(k, v)
      )
    );

    PrismicSharedConfigManager.setProperties(
      { cookies: serializedCookies },
      config
    );
  },

  setAuthCookie(authToken: string): void {
    PrismicSharedConfigManager.setCookie({ [Cookie.AUTH_KEY]: authToken });
  },

  remove(): void {
    return Files.remove(PrismicConfigPath);
  },

  reset(): void {
    return PrismicSharedConfigManager.set(DEFAULT_CONFIG);
  },
};
