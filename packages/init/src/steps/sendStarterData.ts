import axios from "axios";
import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest } from "@slicemachine/core/build/node-utils";
import * as Libraries from "@slicemachine/core/build/libraries";
import type { Component } from "@slicemachine/core/build/models/Library";
import snakeCase from "lodash.snakecase";
import path from "path";
import FormData from "form-data";
import mime from "mime";
import fs from "fs";
import uniqid from "uniqid";
import * as inquirer from "inquirer";

type ApisEndpoints = {
  Models: string;
  AclProvider: string;
};

const ProductionApisEndpoints: ApisEndpoints = {
  Models: "https://customtypes.prismic.io/",
  AclProvider: "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
};

const StageApisEndpoints: ApisEndpoints = {
  Models: "https://customtypes.wroom.io/",
  AclProvider: "https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
};

const getEdnpointsForBase = (base: string): ApisEndpoints => {
  const url = new URL(base);
  if (url.hostname === "wroom.io") return StageApisEndpoints;
  return ProductionApisEndpoints;
};

async function setupS3(
  repository: string,
  authorization: string,
  alcProvider: string
) {
  const acl = await axios
    .get<{
      values: {
        url: string;
        fields: Record<string, string>;
      };
      imgixEndpoint: string;
      err: null | string;
    }>(alcProvider + "create", {
      headers: {
        repository,
        Authorization: authorization,
        "User-Agent": "slice-machine",
      },
    })
    .then((res) => res.data);

  return async (
    sliceName: string,
    variationId: string,
    filePath: string
  ): Promise<string> => {
    const filename = path.basename(filePath);
    const key = `${repository}/shared-slices/${snakeCase(
      sliceName
    )}/${snakeCase(variationId)}-${uniqid()}/${filename}`;

    const form = new FormData();
    Object.entries(acl.values.fields).forEach(([key, value]) => {
      form.append(key, value);
    });
    form.append("key", key);
    const contentType = mime.getType(filePath);
    contentType && form.append("Content-Type", contentType);

    form.append("file", fs.createReadStream(filePath), {
      filename,
    });

    const res = await axios.post(acl.values.url, form, {
      headers: form.getHeaders(),
    });

    const s3ImageUrl = `${acl.imgixEndpoint}/${key}`;

    if (res.status !== 204) {
      const msg =
        "[slice/push] An error occurred while uploading files - please contact support";
      console.error(msg);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error(`Error code: "${res.status}"`);

      throw new Error(msg);
    }

    return s3ImageUrl;
  };
}

export async function sendStarterData(
  repository: string,
  base: string,
  cookies: string,
  cwd: string
) {
  const endpoints = getEdnpointsForBase(base);

  const authTokenFromCookie = parsePrismicAuthToken(cookies);
  const authorization = `Bearer ${authTokenFromCookie}`;

  const smJson = retrieveManifest(cwd);

  if (smJson.exists === false) return Promise.resolve(false);

  // type this later as the slices in the api may not be the same as the slices in sm
  const remoteSlices = await axios
    .get<Array<unknown>>(endpoints.Models + "slices", {
      headers: {
        Authorization: authorization,
        repository,
      },
    })
    .then((res) => res.data);

  if (remoteSlices.length) {
    // do prompt about slices

    const pushAnyway = await inquirer
      .prompt<{ pushSlices: boolean }>([
        {
          type: "confirm",
          name: "pushSlices",
          default: false,
          message:
            "Your repository already contains Slices. Do you want to continue pushing your local Slices?",
        },
      ])
      .then((res) => res.pushSlices);

    if (pushAnyway === false) return Promise.resolve(true);
  }

  if (smJson.content && smJson.content.libraries) {
    const libs = Libraries.libraries(cwd, smJson.content.libraries);

    const components = libs.reduce<Array<Component>>((acc, lib) => {
      return [...acc, ...lib.components];
    }, []);

    const sendToS3 = await setupS3(
      repository,
      authorization,
      endpoints.AclProvider
    );

    const modelPromises = components.map(async ({ screenshotPaths, model }) => {
      const variationsReq = model.variations.map(async (variation) => {
        const pathToScreenShot = screenshotPaths[variation.id];
        if (pathToScreenShot && pathToScreenShot.path) {
          const imageUrl = await sendToS3(
            model.id,
            variation.id,
            pathToScreenShot.path
          ).catch(() => "");
          return {
            ...variation,
            ...(imageUrl ? { imageUrl } : {}), // is image url needed by the api?
          };
        } else {
          return variation;
        }
      });
      const variations = await Promise.all(variationsReq);
      return {
        ...model,
        variations,
      };
    });

    const models = await Promise.all(modelPromises);
    const insertSliceUrl = endpoints.Models + "slices/insert";
    const p = models.map(async (model) => {
      return axios.post(insertSliceUrl, model, {
        headers: {
          Authorization: authorization,
          repository,
          "User-Agent": "slice-machine",
        },
      });
    });

    await Promise.all(p);
  }

  // generate the library-state.json packages/slice-machine/server/src/api/common/LibrariesState.ts
  return Promise.resolve(true);
}
