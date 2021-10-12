import { FileSystem } from "slicemachine-core";
import { parseAuth } from "@lib/auth";

type StatusResponse = {
  status: "error" | "ok" | "pending";
};

export default async function handler(): Promise<StatusResponse> {
  try {
    const authConfig = FileSystem.getOrCreateAuthConfig();
    const authResult = parseAuth(authConfig.cookies);
    return {
      status: authResult.isOk() ? "ok" : "pending",
    };
  } catch (e) {
    return {
      status: "error",
    };
  }
}
