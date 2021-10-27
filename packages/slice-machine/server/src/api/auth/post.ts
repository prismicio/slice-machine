import * as t from "io-ts";
import { fold } from "fp-ts/Either";
import { FileSystem } from "slicemachine-core";

const AuthRequest = t.type({
  email: t.string,
  cookies: t.array(t.string),
});

type AuthRequest = t.TypeOf<typeof AuthRequest>;

type PostAuthResponse = {
  err?: Error;
};

export default async function handler( // eslint-disable-line
  authRequest: Record<string, unknown>
): Promise<PostAuthResponse> {
  return fold(
    () => ({
      err: new Error("Invalid auth payload"),
    }),
    (authRequest: AuthRequest) => {
      FileSystem.setAuthConfig(authRequest.cookies);
      return {};
    }
  )(AuthRequest.decode(authRequest));
}
