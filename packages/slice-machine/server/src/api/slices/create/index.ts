import {
  SliceBody,
  SliceCreateResponse,
} from "../../../../../lib/models/common/Slice";

declare let appRoot: string;

import path from "path";
import { promisify } from "util";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cpy from "copy-template-dir";

import { BackendEnvironment } from "../../../../../lib/models/common/Environment";

import { snakelize } from "../../../../../lib/utils/str";
import Files from "../../../../../lib/utils/files";
import {
  DEFAULT_VARIATION_ID,
  RESERVED_SLICE_NAME,
} from "../../../../../lib/consts";
import * as IO from "../../../../../lib/io";

import save from "../save";

import { paths, SliceTemplateConfig } from "../../../../../lib/models/paths";
import { ApiResult } from "../../../../../lib/models/server/ApiResult";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const copy = promisify(cpy);

const copyTemplate = async (
  env: BackendEnvironment,
  templatePath: string,
  from: string,
  sliceName: string
) => {
  try {
    await copy(templatePath, path.join(env.cwd, from, sliceName), {
      componentName: sliceName,
      componentId: snakelize(sliceName),
      variationId: DEFAULT_VARIATION_ID,
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const message = `[create] Could not copy template. Full error: ${e}`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }
};

const fromTemplate = async (
  env: BackendEnvironment,
  from: string,
  sliceName: string
) => {
  const templatePath = path.join(appRoot, "templates", "slice", env.framework);
  if (!Files.isDirectory(templatePath)) {
    const message = `[create] Framework "${env.framework}" is not supported. (${templatePath}).`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }
  return copyTemplate(env, templatePath, from, sliceName);
};

export default async function handler(req: {
  body: SliceBody;
  env: BackendEnvironment;
}): Promise<ApiResult<SliceCreateResponse>> {
  const { sliceName, from } = req.body;
  const { env } = req;

  if (RESERVED_SLICE_NAME.includes(sliceName)) {
    const msg = `The slice name '${sliceName}' is reserved for slice machine use`;
    return { err: new Error(msg), status: 400, reason: msg };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const pathToModel = paths(env.cwd, "").library(from).slice(sliceName).model();

  const templatePath = SliceTemplateConfig(
    env.cwd /*, pass custom template path here (relative to cwd) */
  );

  if (Files.exists(templatePath) && Files.isDirectory(templatePath)) {
    await copyTemplate(env, templatePath, from, sliceName);
  } else {
    const maybeError = await fromTemplate(env, from, sliceName);
    if (maybeError) {
      return maybeError;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (Files.exists(pathToModel)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const smModel = IO.Slice.readSlice(pathToModel);
    const res = await save({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: { sliceName, from, model: smModel, mockConfig: {} },
      env: env,
    });
    return { ...res, variationId: DEFAULT_VARIATION_ID };
  }

  const msg = `[create] Could not find file model.json. Exiting...`;
  return { err: new Error(msg), status: 500, reason: msg };
}
