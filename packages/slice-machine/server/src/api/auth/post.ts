import * as t from "io-ts";
import { fold } from "fp-ts/Either";
import { FileSystem } from "slicemachine-core";

const AuthRequest = t.type({
  email: t.string,
  cookies: t.array(t.string),
});

type AuthRequest = { email: string; cookies: string[] };

type PostAuthResponse = {
  err?: Error;
};

export default async function handler(authRequest: {
  email: string;
  cookies: string;
}): Promise<PostAuthResponse> {
  try {
    const authPayload = fold(
      () => {
        throw new Error("Invalid auth payload");
      },
      (authRequest: AuthRequest) => authRequest
    )(AuthRequest.decode(authRequest));
    FileSystem.setAuthConfigCookies(authPayload.cookies);
    return {};
  } catch (e) {
    return {
      err: e,
    };
  }
}
