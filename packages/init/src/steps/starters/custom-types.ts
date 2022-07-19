import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { Files, CustomTypesPaths } from "@slicemachine/core/build/node-utils";
import { isLeft } from "fp-ts/lib/Either";
import { promptToPushCustomTypes } from "./prompts";
import { InitClient, logs } from "../../utils";
import { ClientError } from "@slicemachine/client";

export function readLocalCustomTypes(cwd: string): Array<CustomType> {
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

export async function sendCustomTypes(client: InitClient, cwd: string) {
  const localCustomTypes = readLocalCustomTypes(cwd);

  // nothing to push
  if (localCustomTypes.length === 0) return Promise.resolve(false);

  const remoteCustomTypeIds = await client
    .getCustomTypes()
    .then((customTypes) => customTypes.map((customType) => customType.id));

  if (remoteCustomTypeIds.length) {
    const shouldPush = await promptToPushCustomTypes();
    if (shouldPush === false) return Promise.resolve(false);
  }

  const spinner = logs.spinner(
    "Pushing existing custom types to your repository"
  );
  spinner.start();

  await Promise.all(
    localCustomTypes.map(async (customType) => {
      const promise = remoteCustomTypeIds.includes(customType.id)
        ? client.updateCustomType(customType)
        : client.insertCustomType(customType);

      return promise.catch((error: ClientError) => {
        logs.writeError(
          `Sending custom type ${customType.id} - ${error.message}`
        );

        // throwing the error again to stop the Promise.all
        throw error;
      });
    })
  ).catch(() => {
    // the error about the custom type that failed to be pushed should be in the terminal already.
    process.exit(1);
  });

  spinner.succeed();
  return Promise.resolve(true);
}
