import os from "os";
import path from "path";
import { ok, err, Result } from "neverthrow";

import PrismicFile from "./models/common/PrismicFile";
import PrismicData from "./models/common/PrismicData";
import ErrorWithStatus from "./models/common/ErrorWithStatus";
import Files from "./utils/files";
import { Utils } from "slicemachine-core";

export function parsePrismicFile(): Result<PrismicFile, ErrorWithStatus> {
  const home = os.homedir();
  try {
    const prismic = path.join(home, ".prismic");
    if (!Files.exists(prismic)) {
      return err(
        new ErrorWithStatus(
          "~/.prismic file not found. Please log in to Prismic.",
          401
        )
      );
    }
    const { cookies, base } = Files.readJson(prismic);
    return ok({ cookies, base });
  } catch (e) {
    return err(
      new ErrorWithStatus(
        "Could not parse file at ~/.prismic. Are you logged in to Prismic?",
        500
      )
    );
  }
}

export function getPrismicData(): Result<PrismicData, ErrorWithStatus> {
  const result = parsePrismicFile();

  return result.map<PrismicData>((prismicFile) => {
    const authResult = Utils.Cookie.parsePrismicAuthToken(prismicFile.cookies);
    if (!!authResult)
      return { base: prismicFile.base, auth: { auth: authResult } };
    else
      return {
        base: prismicFile.base,
        authError: new ErrorWithStatus(
          `Could not find cookie in ~/.prismic file`,
          400
        ),
      };
  });
}
