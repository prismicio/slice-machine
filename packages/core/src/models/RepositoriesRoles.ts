import * as t from "io-ts";
import { RolesValidator } from "./Roles";

export const RepositoriesRoles = t.record(
  t.string,
  t.type({
    role: RolesValidator,
    dbid: t.string,
  })
);
export type RepositoriesRoles = t.TypeOf<typeof RepositoriesRoles>;
