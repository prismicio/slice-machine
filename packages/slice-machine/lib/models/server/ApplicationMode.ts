import type { Models } from "@slicemachine/core";

export enum ApplicationMode {
  PROD = "prod",
  STAGE = "stage",
  DEV = "dev",
}

export function getApplicationMode(
  apiEndpoint: Models.Manifest["apiEndpoint"]
): ApplicationMode {
  if (apiEndpoint.includes("prismic.io")) return ApplicationMode.PROD;
  else if (apiEndpoint.includes("wroom.io")) return ApplicationMode.STAGE;
  else if (apiEndpoint.includes("wroom.test")) return ApplicationMode.DEV;
  else throw new Error(`Unknown application mode for ${apiEndpoint}`);
}
