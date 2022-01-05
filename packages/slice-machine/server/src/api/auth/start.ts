import { serializeCookies } from "@slicemachine/core/build/src/auth/cookie";
import { SharedConfigManager } from "@slicemachine/core/build/src/prismic";

type StartResponse = {
  err?: Error;
};

export default async function handler(): Promise<StartResponse> {
  try {
    // Reset the prismic auth cookie
    SharedConfigManager.setProperties({
      cookies: serializeCookies([]),
    });
    return {};
  } catch (e) {
    return {
      err: e as Error,
    };
  }
}
