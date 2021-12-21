import { Utils, Auth } from "@slicemachine/core";
import { UserInfo } from "@slicemachine/core/build/src/core/communication";

export async function loginOrBypass(base: string): Promise<UserInfo | null> {
  const user = await Auth.validateSession(base);
  if (user) {
    Utils.writeCheck(`Logged in as ${Utils.bold(user.email)}`);
    return user;
  } else {
    await Auth.login(base);
    const user = await Auth.validateSession(base);
    return user;
  }
}
