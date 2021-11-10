import { FileSystem, Utils } from "@slicemachine/core";
import { CheckAuthStatusResponse } from "@models/common/Auth";

export default async function handler(): Promise<CheckAuthStatusResponse> {
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
