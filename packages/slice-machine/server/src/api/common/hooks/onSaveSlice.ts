import { BackendEnvironment } from "../../../../../lib/models/common/Environment";

import * as Libraries from "@slicemachine/core/build/libraries";
import generateSliceIndex from "../generateSliceIndex";

export default async function onSaveSlice(
  env: BackendEnvironment
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const libraries = await Libraries.libraries(
    env.cwd,
    env.manifest.libraries ?? []
  );
  const localLibs = libraries.filter((e) => e.isLocal);

  for (const lib of localLibs) {
    generateSliceIndex(lib, env.cwd, env.framework);
  }
}
