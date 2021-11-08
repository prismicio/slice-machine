import { ok, err, Result } from "neverthrow";

import PrismicData from "./models/common/PrismicData";
import ErrorWithStatus from "./models/common/ErrorWithStatus";
import { Utils, FileSystem } from "@slicemachine/core";

export function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
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
