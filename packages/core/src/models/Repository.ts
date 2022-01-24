import * as t from "io-ts";
import { RolesValidator } from "../utils/roles";

export const Repository = t.exact(
  t.type({
    domain: t.string,
    name: t.string,
    role: RolesValidator,
  })
);

export type Repository = t.TypeOf<typeof Repository>;
