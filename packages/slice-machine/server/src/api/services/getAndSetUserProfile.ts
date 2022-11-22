import { Client } from "@slicemachine/client";
import { UserProfile } from "@prismic-beta/slicemachine-core/build/models";
import { PrismicSharedConfigManager } from "@prismic-beta/slicemachine-core/build/prismic";

export async function getAndSetUserProfile(
  client: Client
): Promise<UserProfile> {
  return client.profile().then((profile) => {
    PrismicSharedConfigManager.setProperties({
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    });
    return profile;
  });
}
