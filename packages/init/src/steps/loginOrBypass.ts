import { Auth } from "@slicemachine/core/build/src/auth";
import { validateSession } from "@slicemachine/core/build/src/prismic";
import { writeCheck, bold } from "@slicemachine/core/build/src/internals";

import { UserInfo } from "@slicemachine/core/build/src/prismic/communication";

export async function loginOrBypass(base: string): Promise<UserInfo | null> {
  const user = await validateSession(base);
  if (user) {
    writeCheck(`Logged in as ${bold(user.email)}`);
    return user;
  } else {
    await Auth.login(base);
    const user = await validateSession(base);
    return user;
  }
}
