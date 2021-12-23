import { FileSystem } from "@slicemachine/core";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { RequestWithEnv } from "../http/common";

import DefaultClient from "@lib/models/common/http/DefaultClient";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/src/filesystem/PrismicSharedConfig";

export default async function handler(
  req: RequestWithEnv
): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = FileSystem.PrismicSharedConfigManager.getAuth();
    if (!Boolean(authToken)) {
      return { status: "pending" };
    }

    const profile = await DefaultClient.profile(req.env.baseUrl, authToken);
    if (profile instanceof Error) return { status: "error" };

    PrismicSharedConfigManager.setProperties({ userId: profile.userId });
    req.tracker?.resolveUser(profile.userId, req.anonymousId);

    // tracker
    return { status: "ok" };
  } catch (e) {
    return { status: "error" };
  }
}
