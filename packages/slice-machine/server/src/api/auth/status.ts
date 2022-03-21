import { Prismic } from "@slicemachine/core";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { RequestWithEnv } from "../http/common";
import { setShortId } from "../services/setShortId";

export default async function handler(
  req: RequestWithEnv
): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = Prismic.PrismicSharedConfigManager.getAuth();
    if (!Boolean(authToken)) {
      return { status: "pending" };
    }

    const profile = await setShortId(req.env, authToken);

    return { status: "ok", userId: profile.userId };
  } catch (e) {
    console.error(e);
    return { status: "error" };
  }
}
