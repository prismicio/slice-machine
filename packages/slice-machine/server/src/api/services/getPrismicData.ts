import { ok, err, Result } from "neverthrow";

import PrismicData from "@lib/models/common/PrismicData";

import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

import {
  DEFAULT_CONFIG,
  SharedConfigManager,
} from "@slicemachine/core/build/src/prismic";
import { parsePrismicAuthToken } from "@slicemachine/core/build/src/auth/cookie";

export default function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
  try {
    const prismicConfig = SharedConfigManager.get();

    const prismicData: PrismicData = {
      base: prismicConfig.base,
      userId: prismicConfig.userId,
    };

    if (prismicConfig.cookies === DEFAULT_CONFIG.cookies) {
      return ok(prismicData);
    }

    const authResult = parsePrismicAuthToken(prismicConfig.cookies);

    return ok({
      ...prismicData,
      auth: authResult,
    });
  } catch (e) {
    return err(new ErrorWithStatus("Could not parse file at ~/.prismic.", 500));
  }
}
