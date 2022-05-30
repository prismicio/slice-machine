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

async function setupS3(repository: string, authorization: string) {
  const acl = await axios
    .get<{
      values: {
        url: string;
        fields: Record<string, string>;
      };
      imgixEndpoint: string;
      err: null | string;
    }>("https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/create", {
      headers: {
        repository,
        Authorization: authorization,
        "User-Agent": "slice-machine",
      },
    })
    .then((res) => res.data);

  // console.log({ acl });

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
    // console.log({acl})
    const res = await axios.post(acl.values.url, form, {
      headers: form.getHeaders(),
    });
    // console.log({res})

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
  console.log(base);
  // console.log({ repository, base, cookies, cwd });
  const authTokenFromCookie = parsePrismicAuthToken(cookies);
  const authorization = `Bearer ${authTokenFromCookie}`;
  // type this later as the slices in the api may not be the same as the slices in sm
  const remoteSlices = await axios
    .get<Array<unknown>>("https://customtypes.prismic.io/slices", {
      headers: {
        Authorization: authorization,
        repository,
      },
    })
    .then((res) => res.data);

  if (remoteSlices.length) {
    // do prompt about slices
    console.log("Slices Found Do Something");
  }

  // read sm.json to check for slices, if there are none do nothing :)
  const smJson = retrieveManifest(cwd);
  // console.log({ smJson });

  if (smJson.content && smJson.content.libraries) {
    const libs = Libraries.libraries(cwd, smJson.content.libraries); // change this

    const components = libs.reduce<Array<Component>>((acc, lib) => {
      return [...acc, ...lib.components];
    }, []);

    const sendToS3 = await setupS3(repository, authorization);
    // something is wrong here
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
    const p = models.map(async (model) => {
      return axios.post("https://customtypes.prismic.io/slices/insert", model, {
        headers: {
          Authorization: authorization,
          repository,
          "User-Agent": "slice-machine",
        },
      });
    });

    return Promise.all(p);
  }

  // generate the library-state.json packages/slice-machine/server/src/api/common/LibrariesState.ts
  return Promise.resolve();
}
