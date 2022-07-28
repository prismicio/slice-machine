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

  IO.CustomType.renameCustomType(modelPath, newCustomTypeName);

  return {};
}
