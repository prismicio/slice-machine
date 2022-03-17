import { Auth, Models, NodeUtils } from "@slicemachine/core";
import { validateSessionAndGetProfile } from "../utils/communication";

export async function loginOrBypass(base: string): Promise<{
  info: Models.UserInfo;
  profile: Models.UserProfile | null;
} | null> {
  const user = await validateSessionAndGetProfile(base).catch((err) =>
    console.log(err)
  );
  if (user) {
    const email = user.info.email;
    NodeUtils.logs.writeCheck(`Logged in as ${NodeUtils.logs.bold(email)}`);
    return user;
  } else {
    await Auth.login(base);
    const user = await validateSessionAndGetProfile(base);
    return user;
  }
}
