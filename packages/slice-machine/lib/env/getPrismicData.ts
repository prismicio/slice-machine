import { ok, err, Result } from "neverthrow";

import PrismicData from "../models/common/PrismicData";
import { Utils } from "@prismic-beta/slicemachine-core";
import ErrorWithStatus from "../models/common/ErrorWithStatus";
import {
  PrismicSharedConfigManager,
  DEFAULT_CONFIG,
} from "@prismic-beta/slicemachine-core/build/prismic";

export default function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
  try {
    const prismicConfig = PrismicSharedConfigManager.get();

    const prismicData: PrismicData = {
      shortId: prismicConfig.shortId,
      intercomHash: prismicConfig.intercomHash,
    };

    if (prismicConfig.cookies === DEFAULT_CONFIG.cookies) {
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
