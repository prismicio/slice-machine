import { CheckAuthStatusResponse } from "@models/common/Auth";
import { RequestWithEnv } from "../http/common";
import { setShortId } from "../services/setShortId";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";

export default async function handler(
  req: RequestWithEnv
): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = PrismicSharedConfigManager.getAuth();
    if (!Boolean(authToken)) {
      return { status: "pending" };
    }

    const profile = await setShortId(req.env, authToken);

    return { status: "ok", shortId: profile.shortId };
  } catch (e) {
    console.error(e);
    return { status: "error" };
  }
}
