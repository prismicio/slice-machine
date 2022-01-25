import DefaultClient from "@lib/models/common/http/DefaultClient";
import { BackendEnvironment } from "@lib/models/common/Environment";
import { FileSystem } from "@slicemachine/core";
import { UserProfile } from "@slicemachine/core/build/src/models";
import preferWroomBase from "../../../../lib/utils/preferWroomBase";

export async function setShortId(
  env: BackendEnvironment,
  authToken: string
): Promise<UserProfile | Error> {
  const base = preferWroomBase(env.manifest.apiEndpoint, env.prismicData.base);

  // TODO: find out why not handle errors normally here
  const profile = await DefaultClient.profile(base, authToken);

  if (profile instanceof Error) return profile;

  FileSystem.PrismicSharedConfigManager.setProperties({
    shortId: profile.shortId,
  });

  return profile;
}
