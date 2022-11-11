import {
  CustomTypesPaths,
  GeneratedCustomTypesPaths,
} from "../../../../lib/models/paths";
import * as IO from "../../../../lib/io";
import { getBackendState } from "../state";
import { RequestWithEnv } from "../http/common";
import { DeleteCustomTypeQuery } from "../../../../lib/models/common/CustomType";
import { remove as removeCtsFromMockConfig } from "../../../../lib/mock/misc/fs";

export default async function handler(
  req: RequestWithEnv
): Promise<
  { err: unknown; reason: string; status: string } | Record<string, unknown>
> {
  const state = await getBackendState(req.errors, req.env);
  const { id } = req.query as DeleteCustomTypeQuery;
  const ctFolder = CustomTypesPaths(state.env.cwd).customType(id).folder();
  const customTypeAssetsFolder = GeneratedCustomTypesPaths(state.env.cwd)
    .customType(id)
    .folder();

  try {
    IO.CustomType.deleteCustomType(ctFolder);
  } catch (err) {
    console.error(`[custom-type/delete] ${err as string}`);
    return {
      err: err,
      reason: "We couldn't delete your custom type. Check your terminal.",
      status: "500",
      type: "error",
    };
  }

  try {
    IO.CustomType.deleteCustomType(customTypeAssetsFolder);
  } catch (err) {
    console.error(
      `[custom-type/delete] Could not delete your custom type assets files in ${customTypeAssetsFolder}`
    );
    return {
      err: err,
      reason:
        "Something went wrong when deleting your Custom Type. Check your terminal.",
      status: "500",
      type: "warning",
    };
  }

  try {
    removeCtsFromMockConfig(state.env.cwd, { key: id, prefix: "_cts" });
  } catch (err) {
    console.error(
      `[custom-type/delete] Could not delete your custom type from the mock-config.json`
    );
    return {
      err: err,
      reason:
        "Something went wrong when deleting your Custom Type. Check your terminal.",
      status: "500",
      type: "warning",
    };
  }

  try {
    IO.Types.upsert(state.env);
  } catch (err) {
    console.error(`[custom-type/delete] Could not update the project types.`);
    return {
      err: err,
      reason:
        "Something went wrong when deleting your Custom Type. Check your terminal.",
      status: "500",
      type: "warning",
    };
  }

  return {};
}
