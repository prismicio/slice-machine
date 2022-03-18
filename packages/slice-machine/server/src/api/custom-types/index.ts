import * as t from "io-ts";
import glob from "glob";
import { BackendEnvironment } from "@lib/models/common/Environment";
import Files from "@lib/utils/files";
import { CustomTypesPaths } from "@lib/models/paths";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/src/models/CustomType/index";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import { getOrElseW } from "fp-ts/lib/Either";

const handleMatch = (matches: string[]) => {
  return matches.reduce((acc: Array<CustomTypeSM>, p: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jsonCustomType: CustomType = Files.readJson(p);
      return [...acc, CustomTypes.toSM(jsonCustomType)];
    } catch (e) {
      return acc;
    }
  }, []);
};

const fetchRemoteCustomTypes = async (
  env: BackendEnvironment
): Promise<{ remoteCustomTypes: CustomTypeSM[] }> => {
  if (!env.isUserLoggedIn) return { remoteCustomTypes: [] };

  try {
    const res = await env.client.getCustomTypes();
    const { remoteCustomTypes } = await (async (): Promise<{
      remoteCustomTypes: CustomTypeSM[];
    }> => {
      if (res.status > 209) {
        return { remoteCustomTypes: [] };
      }
      const result = await (res.json
        ? (res.json() as Promise<Array<unknown>>)
        : Promise.resolve([]));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const remoteCustomTypes = getOrElseW<unknown, CustomType[]>(() => {
        console.warn("Unable to parse remote custom types.");
        return [];
      })(t.array(CustomType).decode(result));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return {
        remoteCustomTypes: remoteCustomTypes.map((c: CustomType) =>
          CustomTypes.toSM(c)
        ),
      };
    })();
    return { remoteCustomTypes };
  } catch (e) {
    return { remoteCustomTypes: [] };
  }
};

const saveCustomType = (cts: ReadonlyArray<CustomTypeSM>, cwd: string) => {
  for (const ct of cts) {
    Files.write(
      CustomTypesPaths(cwd).customType(ct.id).model(),
      CustomTypes.fromSM(ct)
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
