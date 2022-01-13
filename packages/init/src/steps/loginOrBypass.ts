import { Utils, Auth, Communication } from "@slicemachine/core";

export async function loginOrBypass(
  base: string
): Promise<(Communication.UserInfo & Communication.UserProfile) | null> {
  const user = await Auth.validateSessionAndGetProfile(base);
  if (user) {
    Utils.writeCheck(`Logged in as ${Utils.bold(user.email)}`);
    return user;
  } else {
    await Auth.login(base);
    const user = await Auth.validateSessionAndGetProfile(base);
    return user;
  }
}
