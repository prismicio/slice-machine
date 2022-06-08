import { Models } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";
import { logs, Auth, Client } from "../utils";

export async function loginOrBypass(): Promise<Models.UserProfile> {
  const user: Models.UserProfile | null = await Client.get()
    .profile()
    .catch(() => null);

  if (user) {
    const email = user.email;
    logs.writeCheck(`Logged in as ${logs.bold(email)}`);
    return user;
  }

  await Auth.login(Client.get().apisEndpoints.Wroom);

  // update token used to make calls.
  Client.get().updateAuthenticationToken(PrismicSharedConfigManager.getAuth());

  const userAfterLogin: Models.UserProfile = await Client.get().profile();
  return userAfterLogin;
}
