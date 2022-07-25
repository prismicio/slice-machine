import { CustomTypesPaths } from "@lib/models/paths";
import * as IO from "../io";
import { getBackendState } from "../state";
import { RequestWithEnv } from "../http/common";
import { RenameCustomTypeBody } from "@lib/models/common/CustomType";

export default async function handler(req: RequestWithEnv) {
  const state = await getBackendState(req.errors, req.env);
  const { customTypeId, newCustomTypeName } = req.body as RenameCustomTypeBody;

  const modelPath = CustomTypesPaths(state.env.cwd)
    .customType(customTypeId)
    .model();
  const typesPath = CustomTypesPaths(state.env.cwd)
    .customType(customTypeId)
    .types();

  IO.CustomType.renameCustomType(modelPath, typesPath, newCustomTypeName);

  return {};
}
