import { getPackageChangelog } from "../../../lib/env/versions";

declare let appRoot: string;

export default async function handler() {
  return await getPackageChangelog(appRoot);
}
