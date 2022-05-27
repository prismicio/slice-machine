import { CheckAuthStatusResponse } from "@models/common/Auth";
import { RequestWithEnv } from "../http/common";
import { getAndSetUserProfile } from "../services/getAndSetUserProfile";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";

export default async function handler(
  req: RequestWithEnv
): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = PrismicSharedConfigManager.getAuth();
    if (!Boolean(authToken)) {
      return { status: "pending" };
    }

    const profile = await getAndSetUserProfile(req.env);

    return {
      status: "ok",
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    };
  } catch (e) {
    console.error(e);
    return { status: "error" };
  }
}
