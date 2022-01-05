import { SharedConfigManager } from "@slicemachine/core/build/src/prismic";

import { CheckAuthStatusResponse } from "@models/common/Auth";

export default async function handler(): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = SharedConfigManager.getAuth();
    return {
      status: !!authToken ? "ok" : "pending",
    };
  } catch (e) {
    return {
      status: "error",
    };
  }
}
