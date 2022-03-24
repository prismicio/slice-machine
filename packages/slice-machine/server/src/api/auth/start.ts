import { Utils } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";

type StartResponse = {
  err?: Error;
};

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(): Promise<StartResponse> {
  try {
    // Reset the prismic auth cookie
    PrismicSharedConfigManager.setProperties({
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
