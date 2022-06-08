import axios from "axios";
import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import * as Libraries from "@slicemachine/core/build/libraries";
import type { Component } from "@slicemachine/core/build/models/Library";
import { Slices } from "@slicemachine/core/build/models/Slice";
import snakeCase from "lodash.snakecase";
import path from "path";
import FormData from "form-data";
import mime from "mime";
import fs from "fs";
import uniqid from "uniqid";
import * as inquirer from "inquirer";
import { logs } from "../utils";

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
  ): Promise<string | null> => {
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

    const errorMessage = `[slice/push] An error occurred while uploading preview images for ${sliceName}-${variationId} - please contact support`;

    return axios
      .post(acl.values.url, form, {
        headers: form.getHeaders(),
      })
      .then((res) => {
        if (res.status !== 204) {
          console.log(errorMessage);
          console.log(`Error code: "${res.status}"`);
          return null;
        } else {
          return `${acl.imgixEndpoint}/${key}`;
        }
      })
      .catch((err) => {
        console.log(errorMessage);
        if (axios.isAxiosError(err) && err.response) {
          console.log(
            `[Error: ${err.response.status}] ${err.response.statusText}`
          );
        } else if (err instanceof Error) {
          console.log(err.message);
        } else {
          console.log(String(err));
        }
        return null;
      });
  };
}

export async function sendStarterData(
  repository: string,
  base: string,
  cookies: string,
  cwd: string
) {
  const smJson = retrieveManifest(cwd);
  const hasDocuments = Files.exists(path.join(cwd, "documents"));

  if (smJson.exists === false || hasDocuments === false)
    return Promise.resolve(false);

  const endpoints = getEdnpointsForBase(base);

  const authTokenFromCookie = parsePrismicAuthToken(cookies);
  const authorization = `Bearer ${authTokenFromCookie}`;

  // type this later as the slices in the api may not be the same as the slices in sm
  const remoteSlices = await axios
    .get<Array<{ id: string }>>(endpoints.Models + "slices", {
      headers: {
        Authorization: authorization,
        repository,
      },
    })
    .then((res) => {
      return Array.isArray(res.data) ? res.data.map((model) => model.id) : [];
    });

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

  const spinner = logs.spinner(
    "Pushing existing Slice models to your repository"
  );
  spinner.start();

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
          );
          return {
            ...variation,
            ...(imageUrl ? { imageUrl } : {}),
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

    const p = models.map((model) => {
      const data = Slices.fromSM(model);
      const updateOrInsertUrl = `${endpoints.Models}slices/${
        remoteSlices.includes(model.id) ? "update" : "insert"
      }`;
      return axios
        .post(updateOrInsertUrl, data, {
          headers: {
            Authorization: authorization,
            repository,
          },
        })
        .catch((err) => {
          if (axios.isAxiosError(err) && err.response) {
            console.log(
              `[ERROR: ${err.response.status}] SENDING SLICE ${model.id} | ${err.response.statusText}`
            );
          } else if (err instanceof Error) {
            console.log(`[ERROR] SENDING SLICE ${model.id} ${err.message}`);
          } else {
            console.log(`[ERROR] SENDING SLICE ${model.id} ${String(err)}`);
          }
        });
    });

    await Promise.all(p);
  }

  spinner.succeed();
  return Promise.resolve(true);
}
