import { ApplicationMode } from "@slicemachine/client";
import { Models } from "@prismic-beta/slicemachine-core";

export default function getApplicationMode(
  apiEndpoint: Models.Manifest["apiEndpoint"]
): ApplicationMode {
  if (apiEndpoint.includes("prismic.io")) return ApplicationMode.PROD;
  else if (apiEndpoint.includes("wroom.io")) return ApplicationMode.STAGE;
  else if (apiEndpoint.includes("wroom.test")) return ApplicationMode.DEV;
  else if (apiEndpoint.includes("wroom-qa.com")) return ApplicationMode.DEV;
  else throw new Error(`Unknown application mode for ${apiEndpoint}`);
}
