import * as t from "io-ts";
import { RepositoriesRoles } from "./RepositoriesRoles";

export const UserInfo = t.exact(
  t.type({
    userId: t.string,
    email: t.string,
    type: t.string,
    repositories: RepositoriesRoles,
  })
);
export type UserInfo = t.TypeOf<typeof UserInfo>;
