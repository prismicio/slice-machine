import { FileSystem } from "slicemachine-core";

type StartResponse = {
  err?: Error;
};

export default async function handler(): Promise<StartResponse> {
  try {
    // Reset the prismic auth cookie
    FileSystem.setAuthConfigCookies([]);
    return {};
  } catch (e) {
    return {
      err: e,
    };
  }
}
