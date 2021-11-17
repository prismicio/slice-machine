import { ok, err, Result } from "neverthrow";

import PrismicData from "@lib/models/common/PrismicData";
import { Utils, FileSystem } from "@slicemachine/core";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

export default function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
  try {
    const authConfig = FileSystem.getOrCreateAuthConfig();

    const prismicData: PrismicData = {
      base: authConfig.base,
    };

    if (authConfig.cookies === FileSystem.DEFAULT_CONFIG.cookies) {
      return ok(prismicData);
    }

    const authResult = Utils.Cookie.parsePrismicAuthToken(authConfig.cookies);

    return ok({
      ...prismicData,
      auth: authResult,
    });
  } catch (e) {
    return err(new ErrorWithStatus("Could not parse file at ~/.prismic.", 500));
  }
}
