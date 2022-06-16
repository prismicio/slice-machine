import { Component, Manifest, Slices } from "@slicemachine/core/build/models";
import { Acl, ClientError } from "@slicemachine/client";
import { InitClient, logs } from "../../utils";
import * as Libraries from "@slicemachine/core/build/libraries";
import { promptToPushSlices } from "./prompts";
import { updateSlicesWithScreenshots } from "./s3";
import { writeError } from "../../utils/logs";

export async function sendSlices(
  client: InitClient,
  cwd: string,
  manifest: Manifest
): Promise<boolean> {
  if (!manifest.libraries) return Promise.resolve(false); // No libraries defined

  const libraries = Libraries.libraries(cwd, manifest.libraries);
  const components = libraries.reduce<Array<Component>>((acc, lib) => {
    return [...acc, ...lib.components];
  }, []);

  if (components.length === 0) return Promise.resolve(false); // No slices to send found in the libraries

  const remoteSlicesIds: string[] = await client
    .getSlices()
    .then((slices) => slices.map((slice) => slice.id));

  // If the repository already has Slices, ask the user to confirm.
  if (remoteSlicesIds.length) {
    const pushAnyway = await promptToPushSlices();
    if (pushAnyway === false) return Promise.resolve(true);
  }

  const spinner = logs.spinner(
    "Pushing existing Slice models to your repository"
  );
  spinner.start();

  const acl: Acl = await client.createAcl().catch((error: ClientError) => {
    writeError(
      "Uploading screenshots for your slices failed, please contact us."
    );
    writeError(error.message, "Full error:");
    process.exit(1);
  });

  const models = await updateSlicesWithScreenshots(client, acl, components);

  await Promise.all(
    models.map(async (model) => {
      const slice = Slices.fromSM(model);

      const promise = remoteSlicesIds.includes(slice.id)
        ? client.updateSlice(slice)
        : client.insertSlice(slice);

      return promise.catch((error: ClientError) => {
        logs.writeError(`Sending slice ${model.id} - ${error.message}`);

        // throwing the error again to stop the Promise.all
        throw error;
      });
    })
  ).catch(() => {
    // the error about the slice that failed to be pushed should be in the terminal already.
    process.exit(1);
  });

  spinner.succeed();
  return Promise.resolve(true);
}
