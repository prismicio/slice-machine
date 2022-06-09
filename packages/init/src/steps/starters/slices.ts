import { Component } from "@slicemachine/core/build/models";
import * as Libraries from "@slicemachine/core/build/libraries";
import { logs } from "../../utils";
import { getRemoteSliceIds, sendManyModelsToPrismic } from "./communication";
import { ApiEndpoints } from "./endpoints";
import { promptToPushSlices } from "./prompts";
import { addImageUrlsToModelVariations, createAcl } from "./s3";

export async function sendSlices(
  endpoints: ApiEndpoints,
  repository: string,
  authorization: string,
  libraryPaths: Array<string>,
  cwd: string
) {
  const libraries = Libraries.libraries(cwd, libraryPaths);

  const remoteSlices = await getRemoteSliceIds(
    endpoints.Models,
    repository,
    authorization
  );

  if (libraries.length === 0) return Promise.resolve(false);

  if (remoteSlices.length) {
    // do prompt about slices

    const pushAnyway = await promptToPushSlices();

    if (pushAnyway === false) return Promise.resolve(true);
  }

  const spinner = logs.spinner(
    "Pushing existing Slice models to your repository"
  );
  spinner.start();

  const acl = await createAcl(endpoints.AclProvider, repository, authorization);

  const components = libraries.reduce<Array<Component>>((acc, lib) => {
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

  spinner.succeed();
  return Promise.resolve(true);
}
