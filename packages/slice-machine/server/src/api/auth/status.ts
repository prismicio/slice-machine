import { FileSystem, Utils } from "@slicemachine/core";

type StatusResponse = {
  status: "error" | "ok" | "pending";
};

export default async function handler(): Promise<StatusResponse> {
  try {
    const authConfig = FileSystem.getOrCreateAuthConfig();
    const authResult = Utils.Cookie.parsePrismicAuthToken(authConfig.cookies);
    return {
      status: !!authResult ? "ok" : "pending",
    };
  } catch (e) {
    return {
      status: "error",
    };
  }
}
