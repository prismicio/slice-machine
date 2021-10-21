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

export default async function handler(
  authRequest: Record<string, unknown>
): Promise<PostAuthResponse> {
  try {
    const authPayload = fold(
      () => {
        throw new Error("Invalid auth payload");
      },
      (authRequest: AuthRequest) => authRequest
    )(AuthRequest.decode(authRequest));
    FileSystem.setAuthConfig(authPayload.cookies);
    return {};
  } catch (e) {
    return {
      err: e,
    };
  }
}
