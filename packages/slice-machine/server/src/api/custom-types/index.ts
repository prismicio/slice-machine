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
import { getLocalCustomTypes } from "@lib/utils/customTypes";

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
  const folderExists = Files.exists(pathToCustomTypes);

  const { remoteCustomTypes } = await fetchRemoteCustomTypes(env);

  if (!folderExists) {
    saveCustomType(remoteCustomTypes, cwd);
  }

  return {
    customTypes: getLocalCustomTypes(cwd),
    remoteCustomTypes,
  };
}
