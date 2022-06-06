import * as t from "io-ts";

export const AclCreateResult = t.exact(
  t.intersection([
    t.type({
      values: t.type({
        url: t.string,
        fields: t.record(t.string, t.string),
      }),
      imgixEndpoint: t.string,
    }),
    t.partial({
      message: t.string,
      Message: t.string,
      error: t.string,
    }),
  ])
);

export type AclCreateResult = t.TypeOf<typeof AclCreateResult>;
