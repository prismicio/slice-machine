import glob from "glob";
import { BackendEnvironment } from "@lib/models/common/Environment";
import Files from "@lib/utils/files";
import { CustomTypesPaths } from "@lib/models/paths";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType/index";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import * as IO from "../io";
import { ClientError } from "@slicemachine/client";

const handleMatch = (matches: string[]) => {
  return matches.reduce((acc: Array<CustomTypeSM>, p: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const smModel = IO.CustomType.readCustomType(p);
      return [...acc, smModel];
    } catch (e) {
      return acc;
    }
  }, []);
};

const fetchRemoteCustomTypes = async (
  env: BackendEnvironment
): Promise<{ remoteCustomTypes: CustomTypeSM[] }> => {
  return env.client
    .getCustomTypes()
    .then((customTypes: CustomType[]) => ({
      remoteCustomTypes: customTypes.map((c: CustomType) =>
        CustomTypes.toSM(c)
      ),
    }))
    .catch((error: ClientError) => {
      console.warn(error.message);
      return { remoteCustomTypes: [] };
    });
};

const saveCustomType = (cts: ReadonlyArray<CustomTypeSM>, cwd: string) => {
  for (const ct of cts) {
    IO.CustomType.writeCustomType(
      CustomTypesPaths(cwd).customType(ct.id).model(),
      ct
    );
  }
};

export default async function handler(env: BackendEnvironment): Promise<{
  customTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
}> {
  const { cwd } = env;

  const pathToCustomTypes = CustomTypesPaths(cwd).value();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const folderExists = Files.exists(pathToCustomTypes);

  const { remoteCustomTypes } = await fetchRemoteCustomTypes(env);

  if (!folderExists) {
    saveCustomType(remoteCustomTypes, cwd);
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`);
  return {
    customTypes: handleMatch(matches),
    remoteCustomTypes,
  };
}
