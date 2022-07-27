import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import * as Libraries from "@slicemachine/core/build/libraries";
import {
  CustomPaths,
  GeneratedPaths,
} from "@slicemachine/core/build/node-utils/paths";
import * as IO from "../io";
import fs from "fs";
import onSaveSlice from "../common/hooks/onSaveSlice";

interface RenameSliceBody {
  sliceId: string;
  newSliceName: string;
  libName: string;
}

export async function renameSlice(req: {
  body: RenameSliceBody;
  env: BackendEnvironment;
}) {
  const { env } = req;
  const { sliceId, newSliceName, libName } = req.body;

  if (!env.manifest.libraries) {
    const message = `[renameSlice] When renaming slice: ${sliceId}, there were no libraries configured in your SM.json.`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }
  const libraries = Libraries.libraries(env.cwd, env.manifest.libraries);
  const desiredLibrary = libraries.find((library) => library.name === libName);
  if (!desiredLibrary) {
    const message = `[renameSlice] When renaming slice: ${sliceId}, the library: ${libName} was not found.`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }
  const desiredSlice = desiredLibrary.components.find(
    (component) => component.model.id === sliceId
  );

  if (!desiredSlice) {
    const message = `[renameSlice] When renaming slice: ${sliceId}, the slice: ${sliceId} was not found.`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }

  const sliceDirectory = CustomPaths(env.cwd)
    .library(libName)
    .slice(desiredSlice.model.name);

  const generatedSliceDirectory = GeneratedPaths(env.cwd)
    .library(libName)
    .slice(desiredSlice.model.name);

  IO.Slice.renameSlice(sliceDirectory.model(), newSliceName);

  fs.renameSync(
    sliceDirectory.value(),
    `${CustomPaths(env.cwd).library(libName).value()}/${newSliceName}`
  );

  fs.renameSync(
    generatedSliceDirectory.value(),
    `${GeneratedPaths(env.cwd).library(libName).value()}/${newSliceName}`
  );

  await onSaveSlice(env);

  return desiredSlice;
}
