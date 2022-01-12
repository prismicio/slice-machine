import { FileSystem } from "@slicemachine/core";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { RequestWithEnv } from "../http/common";
import { setShortId } from "../services/setShortId";

export default async function handler(
  req: RequestWithEnv
): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = FileSystem.PrismicSharedConfigManager.getAuth();
    if (!Boolean(authToken)) {
      return { status: "pending" };
    }

    const profile = await setShortId(req.env, authToken);
    if (profile instanceof Error) return { status: "error" };

    req.tracker?.resolveUser(profile.shortId, req.anonymousId);

    // tracker
    return { status: "ok", userId: profile.userId };
  } catch (e) {
    return { status: "error" };
  }
}
