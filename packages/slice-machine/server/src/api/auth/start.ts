import { FileSystem, Utils } from "@slicemachine/core";

type StartResponse = {
  err?: Error;
};

export default async function handler(): Promise<StartResponse> {
  try {
    // Reset the prismic auth cookie
    FileSystem.PrismicSharedConfigManager.setProps({
      cookies: Utils.Cookie.serializeCookies([]),
    });
    return {};
  } catch (e) {
    return {
      err: e,
    };
  }
}
