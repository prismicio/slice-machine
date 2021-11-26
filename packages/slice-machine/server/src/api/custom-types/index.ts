import path from "path";
import glob from "glob";
import BackendEnvironment from "@lib/models/common/Environment";
import {
  CustomType,
  CustomTypeJsonModel,
  ObjectTabs,
} from "@lib/models/common/CustomType";
import Files from "@lib/utils/files";
import { CustomTypesPaths } from "@lib/models/paths";

const handleMatch = (matches: string[], env: BackendEnvironment) => {
  return matches.reduce((acc: Array<CustomType<ObjectTabs>>, p: string) => {
    const key = path.basename(path.dirname(p));
    const pathToPreview = path.join(path.dirname(p), "index.png");
    try {
      const jsonCustomType: CustomTypeJsonModel = Files.readJson(p);
      return [
        ...acc,
        {
          ...CustomType.fromJsonModel(key, jsonCustomType),
          previewUrl: Files.exists(pathToPreview)
            ? `${env.baseUrl}/api/__preview?q=${encodeURIComponent(
                path.join(path.dirname(p), "index.png")
              )}&uniq=${Math.random()}`
            : undefined,
        },
      ];
    } catch (e) {
      return acc;
    }
  }, []);
};

const fetchRemoteCustomTypes = async (
  env: BackendEnvironment
): Promise<{ remoteCustomTypes: CustomTypeJsonModel[]; isFake?: boolean }> => {
  if (env.client.isFake()) {
    return { remoteCustomTypes: [], isFake: true };
  }
  try {
    const res = await env.client.getCustomTypes();
    const { remoteCustomTypes } = await (async (): Promise<{
      remoteCustomTypes: CustomTypeJsonModel[];
    }> => {
      if (res.status > 209) {
        return { remoteCustomTypes: [] };
      }
      const remoteCustomTypes = await (res.json
        ? res.json()
        : Promise.resolve([]));
      return { remoteCustomTypes };
    })();
    return { remoteCustomTypes };
  } catch (e) {
    return { remoteCustomTypes: [] };
  }
};

const saveCustomTypes = (
  cts: ReadonlyArray<CustomTypeJsonModel>,
  cwd: string
) => {
  for (const ct of cts) {
    Files.write(CustomTypesPaths(cwd).customType(ct.id).model(), ct);
  }
};

export default async function handler(env: BackendEnvironment): Promise<{
  isFake: boolean;
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
}> {
  const { cwd } = env;
  const pathToCustomTypes = CustomTypesPaths(cwd).value();
  const folderExists = Files.exists(pathToCustomTypes);

  const { remoteCustomTypes, isFake } = await fetchRemoteCustomTypes(env);

  if (!folderExists) {
    saveCustomTypes(remoteCustomTypes, cwd);
  }
  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`);
  return {
    isFake: !!isFake,
    customTypes: handleMatch(matches, env),
    remoteCustomTypes: remoteCustomTypes.map((ct: any) =>
      CustomType.fromJsonModel(ct.id, ct)
    ),
  };
}
