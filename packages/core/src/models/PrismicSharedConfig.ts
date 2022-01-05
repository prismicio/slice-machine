import * as t from "io-ts";

export const PrismicSharedConfig = t.intersection([
  t.type({
    base: t.string,
    cookies: t.string,
  }),
  t.partial({
    userId: t.union([t.string, t.undefined]),
    shortId: t.union([t.string, t.undefined]),
    oauthAccessToken: t.string,
    authUrl: t.string,
  }),
]);
export type PrismicSharedConfig = t.TypeOf<typeof PrismicSharedConfig>;
