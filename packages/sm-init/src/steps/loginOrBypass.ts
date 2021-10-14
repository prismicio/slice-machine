import { Utils, Auth } from "slicemachine-core";

export async function loginOrBypass(base: string): Promise<void> {
  const user = await Auth.validateSession(base);
  if (user) return Utils.writeCheck(`Logged in as ${Utils.bold(user.email)}`);
  else await Auth.login(base);
}
