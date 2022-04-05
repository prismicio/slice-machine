import DefaultClient from "@lib/models/common/http/DefaultClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { UserProfile } from "@slicemachine/core/build/models";
import preferWroomBase from "../../../../lib/utils/preferWroomBase";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";

export async function getAndSetUserProfile(
  env: BackendEnvironment,
  authToken: string
): Promise<UserProfile> {
  const base = preferWroomBase(env.manifest.apiEndpoint);

  return DefaultClient.profile(base, authToken).then((profile) => {
    PrismicSharedConfigManager.setProperties({
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    });
    return profile;
  });
}
