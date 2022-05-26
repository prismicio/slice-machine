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
        authorization,
        "User-Agent": "slice-machine",
      },
    })
    .then((res) => res.data);

  // console.log({ acl });

  return async (sliceName: string, variationId: string, filePath: string) => {
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

    return { s3ImageUrl };
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
        authorization,
        repository,
      },
    })
    .then((res) => res.data);

  if (remoteSlices.length) {
    // do prompt about slices
    console.log("Slices Found Do Something");
  }

  // Cloud save a lot of effort and use the library state file if path to screen shot was relevant
  // const libraryState = await fs.readFile(LibrariesStatePath(cwd), 'utf-8') as unknown as Models.LibrariesState.Libraries
  // const components = Object.values(libraryState).reduce<LibrariesState.Component[]>((acc, curr) => {
  //   return [...acc, ...Object.values(curr.components)]
  // },[])

  // read sm.json to check for slices, if there are none do nothing :)
  const smJson = retrieveManifest(cwd);
  // console.log({ smJson });

  if (smJson.content && smJson.content.libraries) {
    const libs = Libraries.libraries(cwd, smJson.content.libraries);

    const components = libs.reduce<Array<Component>>((acc, lib) => {
      return [...acc, ...lib.components];
    }, []);

    const sendToS3 = await setupS3(repository, authorization);
    // something is wrong here
    components.map(async ({ screenshotPaths, model }) => {
      const p = model.variations.map(async (variation) => {
        const pathToScreenShot = screenshotPaths[variation.id];
        if (pathToScreenShot && pathToScreenShot.path) {
          await sendToS3(model.id, variation.id, pathToScreenShot.path);
        }
      });
      return Promise.all(p);
    }); // question can s3 handel multiple files at once?

    // screen shots need to go first and the imageUrl is added to the

    // const modelsToSend = components.map(async ({model}) => {
    //   return axios.post(slicesEndpointURL + '/insert', model, { headers }) // how to handel errors
    // })

    // Promise.all(modelsToSend)
  }

  // generate the library-state.json packages/slice-machine/server/src/api/common/LibrariesState.ts
  return Promise.resolve();
}
