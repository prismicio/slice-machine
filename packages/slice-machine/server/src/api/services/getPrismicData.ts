import { ok, err, Result } from "neverthrow";

import PrismicData from "@lib/models/common/PrismicData";
import { Utils, Prismic } from "@slicemachine/core";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

export default function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
  try {
    const prismicConfig = Prismic.PrismicSharedConfigManager.get();

    const prismicData: PrismicData = {
      shortId: prismicConfig.shortId,
    };

    if (prismicConfig.cookies === Prismic.DEFAULT_CONFIG.cookies) {
      return ok(prismicData);
    }

    return ok({
      ...prismicData,
      auth: Utils.Cookie.parsePrismicAuthToken(prismicConfig.cookies),
    });
  } catch (e) {
    return err(new ErrorWithStatus("Could not parse file at ~/.prismic.", 500));
  }
}
