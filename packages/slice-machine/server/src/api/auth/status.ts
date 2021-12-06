import { FileSystem } from "@slicemachine/core";
import { CheckAuthStatusResponse } from "@models/common/Auth";

export default async function handler(): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = FileSystem.PrismicSharedConfigManager.getAuth();
    return {
      status: !!authToken ? "ok" : "pending",
    };
  } catch (e) {
    return {
      status: "error",
    };
  }
}
