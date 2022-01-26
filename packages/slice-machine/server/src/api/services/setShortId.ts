import DefaultClient from "@lib/models/common/http/DefaultClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { FileSystem } from "@slicemachine/core";
import { UserProfile } from "@slicemachine/core/build/src/models";
import preferWroomBase from "../../../../lib/utils/preferWroomBase";

export async function setShortId(
  env: BackendEnvironment,
  authToken: string
): Promise<UserProfile> {
  const base = preferWroomBase(env.manifest.apiEndpoint);

  return DefaultClient.profile(base, authToken).then((profile) => {
    FileSystem.PrismicSharedConfigManager.setProperties({
      shortId: profile.shortId,
    });
    return profile;
  });
}
