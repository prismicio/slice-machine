import path from "path";
import glob from "glob";
import Environment from "@lib/models/common/Environment";
import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";
import Files from "@lib/utils/files";
import { CustomTypesPaths } from "@lib/models/paths";

const handleMatch = (matches: string[], env: Environment) => {
  return matches.reduce((acc: Array<CustomType<ObjectTabs>>, p: string) => {
    const key = path.basename(path.dirname(p));
    const pathTopreview = path.join(path.dirname(p), "index.png");
    try {
      const ct = Files.readJson(p);
      return [
        ...acc,
        {
          ...CustomType.fromJsonModel(key, ct),
          previewUrl: Files.exists(pathTopreview)
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

const fetchRemoteCustomTypes = async (env: Environment) => {
  if (env.client.isFake()) {
    return { remoteCustomTypes: [], isFake: true };
  }
  const res = await env.client.getCustomTypes();
  const { remoteCustomTypes } = await (async () => {
    if (res.status > 209) {
      return { remoteCustomTypes: [] };
    }
    const r = await (res.json ? res.json() : Promise.resolve([]));
    return { remoteCustomTypes: r };
  })();
  return { remoteCustomTypes };
};

const saveCustomTypes = (cts: ReadonlyArray<any>, cwd: string) => {
  for (const ct of cts) {
    Files.write(CustomTypesPaths(cwd).customType(ct.id).model(), ct);
  }
};

export default async function handler(env: Environment): Promise<{
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
