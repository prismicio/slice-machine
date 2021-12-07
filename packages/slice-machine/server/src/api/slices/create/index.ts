declare let appRoot: string;

import type Models from "@slicemachine/core/build/src/models";
import path from "path";
import { promisify } from "util";

// @ts-ignore
import cpy from "copy-template-dir";

import { BackendEnvironment } from "@lib/models/common/Environment";

import getEnv from "../../services/getEnv";
import { snakelize } from "@lib/utils/str";
import Files from "@lib/utils/files";

import save from "../save";

import { paths, SliceTemplateConfig } from "@lib/models/paths";

const copy = promisify(cpy);

const IndexFiles = {
  none: null,
  react: "index.js",
  next: "index.js",
  nuxt: "index.vue",
  vue: "index.vue",
  vanillajs: "index.js",
  svelte: "index.svelte",
};

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
      variationId: "default-slice",
    });
  } catch (e) {
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

export default async function handler({
  sliceName,
  from,
  values,
}: {
  sliceName: string;
  from: string;
  values?: { componentCode: string; model: Models.SliceAsObject };
}) {
  const { env } = await getEnv();

  const pathToModel = paths(env.cwd, "").library(from).slice(sliceName).model();

  if (!values) {
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
  } else {
    const fileName = IndexFiles[env.framework] || "index.js";
    const pathToIndexFile = path.join(
      paths(env.cwd, "").library(from).slice(sliceName).value(),
      fileName
    );

    Files.write(pathToModel, JSON.stringify(values.model, null, 2));
    Files.write(pathToIndexFile, values.componentCode);
  }

  if (Files.exists(pathToModel)) {
    const model = Files.readJson(pathToModel);
    const res = await save({
      body: { sliceName, from, model, mockConfig: {} },
    });
    return {
      ...res,
      variationId: "default-slice",
    };
  }

  const msg = `[create] Could not find file model.json. Exiting...`;
  return { err: new Error(msg), status: 500, reason: msg };
}
