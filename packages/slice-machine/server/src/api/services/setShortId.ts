import DefaultClient from "@lib/models/common/http/DefaultClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { FileSystem } from "@slicemachine/core";
import { UserProfile } from "@slicemachine/core/build/src/models";

export async function setShortId(
  env: BackendEnvironment,
  authToken: string
): Promise<UserProfile | Error> {
  const profile = await DefaultClient.profile(env.baseUrl, authToken);
  if (profile instanceof Error) return profile;

  FileSystem.PrismicSharedConfigManager.setProperties({
    shortId: profile.shortId,
  });

  return profile;
}
