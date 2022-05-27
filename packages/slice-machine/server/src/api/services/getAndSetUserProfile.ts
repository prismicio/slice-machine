import { BackendEnvironment } from "@lib/models/common/Environment";
import { UserProfile } from "@slicemachine/core/build/models";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";

export async function getAndSetUserProfile(
  env: BackendEnvironment
): Promise<UserProfile> {
  return env.client.profile().then((profile) => {
    PrismicSharedConfigManager.setProperties({
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    });
    return profile;
  });
}
