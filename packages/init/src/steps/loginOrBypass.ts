import { Utils, Communication, Auth } from "@slicemachine/core";
import {
  validateSessionAndGetProfile,
  UserProfile,
} from "../utils/communication";

export async function loginOrBypass(base: string): Promise<{
  info: Communication.UserInfo;
  profile: UserProfile | null;
} | null> {
  const user = await validateSessionAndGetProfile(base).catch((err) =>
    console.log(err)
  );
  if (user) {
    const email = user.info.email;
    Utils.writeCheck(`Logged in as ${Utils.bold(email)}`);
    return user;
  } else {
    await Auth.login(base);
    const user = await validateSessionAndGetProfile(base);
    return user;
  }
}
