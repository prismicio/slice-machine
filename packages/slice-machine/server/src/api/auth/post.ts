import * as t from "io-ts";
import { fold } from "fp-ts/Either";

import { serializeCookies } from "@slicemachine/core/build/src/auth/cookie";
import { SharedConfigManager } from "@slicemachine/core/build/src/prismic";

const AuthRequest = t.type({
  email: t.string,
  cookies: t.array(t.string),
});

type AuthRequest = t.TypeOf<typeof AuthRequest>;

type PostAuthResponse = {
  err?: Error;
};

export default function handler(
  authRequest: Record<string, unknown>
): PostAuthResponse {
  return fold(
    () => ({
      err: new Error("Invalid auth payload"),
    }),
    (authRequest: AuthRequest) => {
      SharedConfigManager.setProperties({
        cookies: serializeCookies(authRequest.cookies),
      });
      return {};
    }
  )(AuthRequest.decode(authRequest));
}
