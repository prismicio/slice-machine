import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { Files, CustomTypesPaths } from "@slicemachine/core/build/node-utils";
import { isLeft } from "fp-ts/lib/Either";
import {
  getRemoteCustomTypeIds,
  sendManyCustomTypesToPrismic,
} from "./communication";
import { promptToPushCustomTypes } from "./prompts";
import { getEndpointsFromBase } from "./endpoints";
import { logs } from "../../utils";

export function readCustomTypes(cwd: string): Array<CustomType> {
  const customTypePaths = CustomTypesPaths(cwd);
  const dir = customTypePaths.value();

  if (Files.isDirectory(dir) === false) return [];

  const fileNames = Files.readDirectory(dir);

  const files = fileNames.reduce<Array<CustomType>>((acc, fileName) => {
    const filePath = customTypePaths.customType(fileName).model();
    const json = Files.safeReadJson(filePath);

    if (!json) return acc;

    const file = CustomType.decode(json);

    if (file instanceof Error) {
      logs.writeError(`reading ${filePath}: ${file.message}`);
      return acc;
    }
    if (isLeft(file)) {
      logs.writeError(`validating ${filePath}: ${JSON.stringify(file.left)}`);
      return acc;
    }

    return [...acc, file.right];
  }, []);

  return files;
}

export async function sendCustomTypesFromStarter(
  repository: string,
  authorization: string,
  base: string,
  cwd: string
) {
  const customTypeApiEndpoint = getEndpointsFromBase(base).Models;

  const customTypes = readCustomTypes(cwd);

  if (customTypes.length === 0) return Promise.resolve(false);

  const remoteCustomTypeIds = await getRemoteCustomTypeIds(
    customTypeApiEndpoint,
    repository,
    authorization
  );

  if (remoteCustomTypeIds.length) {
    const shouldPush = await promptToPushCustomTypes();
    if (shouldPush === false) return Promise.resolve(false);
  }

  const spinner = logs.spinner(
    "Pushing existing custom types to your repository"
  );
  spinner.start();

  await sendManyCustomTypesToPrismic(
    repository,
    authorization,
    customTypeApiEndpoint,
    remoteCustomTypeIds,
    customTypes
  );

  spinner.succeed();

  return Promise.resolve(true);
}
