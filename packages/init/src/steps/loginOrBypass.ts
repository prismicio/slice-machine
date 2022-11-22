import { Models } from "@prismic-beta/slicemachine-core";
import { PrismicSharedConfigManager } from "@prismic-beta/slicemachine-core/build/prismic";
import { logs, Auth, InitClient } from "../utils";

export async function loginOrBypass(
  client: InitClient
): Promise<Models.UserProfile> {
  const user: Models.UserProfile | null = await client
    .profile()
    .catch(() => null);

  if (user) {
    const email = user.email;
    logs.writeCheck(`Logged in as ${logs.bold(email)}`);
    return user;
  }

  await Auth.login(client);

  // update token used to make calls.
  client.updateAuthenticationToken(PrismicSharedConfigManager.getAuth());

  const userAfterLogin: Models.UserProfile = await client.profile();
  return userAfterLogin;
}
