import path from "path";
import glob from "glob";
import { BackendEnvironment } from "@lib/models/common/Environment";
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
): Promise<{ remoteCustomTypes: CustomTypeJsonModel[] }> => {
  if (!env.isUserLoggedIn) return { remoteCustomTypes: [] };

  try {
    const res = await env.client.getCustomTypes();
    const { remoteCustomTypes } = await (async (): Promise<{
      remoteCustomTypes: CustomTypeJsonModel[];
    }> => {
      if (res.status > 209) {
        return { remoteCustomTypes: [] };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const remoteCustomTypes = await (res.json
        ? res.json()
        : Promise.resolve([]));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    Files.write(CustomTypesPaths(cwd).customType(ct.id).model(), ct);
  }
};

export default async function handler(env: BackendEnvironment): Promise<{
  customTypes: ReadonlyArray<CustomType<ObjectTabs>>;
  remoteCustomTypes: ReadonlyArray<CustomType<ObjectTabs>>;
}> {
  const { cwd } = env;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pathToCustomTypes = CustomTypesPaths(cwd).value();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const folderExists = Files.exists(pathToCustomTypes);

  const { remoteCustomTypes } = await fetchRemoteCustomTypes(env);

  if (!folderExists) {
    saveCustomTypes(remoteCustomTypes, cwd);
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`);
  return {
    customTypes: handleMatch(matches, env),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remoteCustomTypes: remoteCustomTypes.map((ct: any) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      CustomType.fromJsonModel(ct.id, ct)
    ),
  };
}
