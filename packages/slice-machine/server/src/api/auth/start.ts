import { FileSystem, Utils } from "@slicemachine/core";

type StartResponse = {
  err?: Error;
};

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(): Promise<StartResponse> {
  try {
    // Reset the prismic auth cookie
    FileSystem.PrismicSharedConfigManager.setProperties({
      cookies: Utils.Cookie.serializeCookies([]),
    });
    return {};
  } catch (e) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      err: e,
    };
  }
}
