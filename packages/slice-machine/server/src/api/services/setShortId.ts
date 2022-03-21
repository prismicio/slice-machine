import DefaultClient from "@lib/models/common/http/DefaultClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { Prismic } from "@slicemachine/core";
import { UserProfile } from "@slicemachine/core/build/models";
import preferWroomBase from "../../../../lib/utils/preferWroomBase";

export async function setShortId(
  env: BackendEnvironment,
  authToken: string
): Promise<UserProfile> {
  const base = preferWroomBase(env.manifest.apiEndpoint);

  return DefaultClient.profile(base, authToken).then((profile) => {
    Prismic.PrismicSharedConfigManager.setProperties({
      shortId: profile.shortId,
    });
    return profile;
  });
}
