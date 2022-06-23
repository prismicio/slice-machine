import getEnv from "../services/getEnv";
import { CustomTypesPaths } from "@lib/models/paths";

import { RenameCustomTypeBody } from "@lib/models/common/CustomType";
import * as IO from "../io";

export default async function handler(req: { body: RenameCustomTypeBody }) {
  const { env } = await getEnv();
  const { customTypeId, newCustomTypeName } = req.body;

  const modelPath = CustomTypesPaths(env.cwd).customType(customTypeId).model();

  IO.CustomType.renameCustomType(modelPath, newCustomTypeName);

  return {};
}
