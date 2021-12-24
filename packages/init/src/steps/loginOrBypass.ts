import { Auth } from "@slicemachine/core/build/src/auth";
import { validateSession } from "@slicemachine/core/build/src/prismic";
import { writeCheck, bold } from "@slicemachine/core/build/src/internals";

export async function loginOrBypass(base: string): Promise<void> {
  const user = await validateSession(base);
  if (user) return writeCheck(`Logged in as ${bold(user.email)}`);
  else await Auth.login(base);
}
