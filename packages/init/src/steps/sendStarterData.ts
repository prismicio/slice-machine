import { parsePrismicAuthToken } from "@slicemachine/core/build/utils/cookie";
import { retrieveManifest, Files } from "@slicemachine/core/build/node-utils";
import * as Libraries from "@slicemachine/core/build/libraries";
import type { Component } from "@slicemachine/core/build/models/Library";
import path from "path";
import { logs } from "../utils";
import { getEndpointsFromBase } from "./starters/endpoints";
import { createAcl, addImageUrlsToModelVariations } from "./starters/s3";
import { promptToPushSlices } from "./starters/prompts";
import {
  getRemoteSliceIds,
  sendManyModelsToPrismic,
} from "./starters/communication";

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

  const endpoints = getEndpointsFromBase(base);

  const authTokenFromCookie = parsePrismicAuthToken(cookies);
  const authorization = `Bearer ${authTokenFromCookie}`;

  // type this later as the slices in the api may not be the same as the slices in sm
  const remoteSlices = await getRemoteSliceIds(
    endpoints.Models,
    repository,
    authorization
  );

  if (remoteSlices.length) {
    // do prompt about slices

    const pushAnyway = await promptToPushSlices();

    if (pushAnyway === false) return Promise.resolve(true);
  }

  const spinner = logs.spinner(
    "Pushing existing Slice models to your repository"
  );
  spinner.start();

  if (smJson.content && smJson.content.libraries) {
    const libs = Libraries.libraries(cwd, smJson.content.libraries);

    const acl = await createAcl(
      endpoints.AclProvider,
      repository,
      authorization
    );

    const components = libs.reduce<Array<Component>>((acc, lib) => {
      return [...acc, ...lib.components];
    }, []);

    const models = await addImageUrlsToModelVariations(
      acl,
      repository,
      components
    );

    await sendManyModelsToPrismic(
      repository,
      authorization,
      endpoints.Models,
      remoteSlices,
      models
    );
  }

  spinner.succeed();
  return Promise.resolve(true);
}
