import { Auth } from "@slicemachine/core/build/src/auth";
import { writeCheck, bold } from "@slicemachine/core/build/src/internals";

import { UserInfo } from "@slicemachine/core/build/src/prismic/communication";

export async function loginOrBypass(base: string): Promise<UserInfo | null> {
  const user = await Auth.validateSession(base);
  if (user) {
    writeCheck(`Logged in as ${bold(user.email)}`);
    return user;
  } else {
    await Auth.login(base);
    const user = await Auth.validateSession(base);
    return user;
  }
}
