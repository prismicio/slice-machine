import * as t from "io-ts";

import { Repository } from "./Repository";

export const Repositories = t.array(Repository);
export type Repositories = t.TypeOf<typeof Repositories>;
