import * as t from "io-ts";
import { fold } from "fp-ts/Either";
import { Utils } from "@slicemachine/core";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/prismic";

const AuthRequest = t.type({
  email: t.string,
  cookies: t.array(t.string),
});

type AuthRequest = t.TypeOf<typeof AuthRequest>;

type PostAuthResponse = {
  err?: Error;
};

export default function handler(
  wroomEndpoint: string,
  authRequest: Record<string, unknown>
): PostAuthResponse {
  return fold(
    () => ({
      err: new Error("Invalid auth payload"),
    }),
    (authRequest: AuthRequest) => {
      PrismicSharedConfigManager.setProperties({
        base: wroomEndpoint,
        cookies: Utils.Cookie.serializeCookies(authRequest.cookies),
      });
      return {};
    }
  )(AuthRequest.decode(authRequest));
}
