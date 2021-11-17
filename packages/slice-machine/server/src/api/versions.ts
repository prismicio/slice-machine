import { hasYarn, checkVersion } from "@lib/utils/version";
import { name } from "../../../package.json";

export type VersionInfo =
  | {
      updateCommand: string;
      packageManager: string;
      update: boolean;
      current: string;
      recent: string;
      err?: undefined;
    }
  | {
      err: unknown;
    };

export default async function versions(): Promise<VersionInfo> {
  try {
    const details = await checkVersion();
    const packageManager = hasYarn() ? "yarn" : "npm";
    const updateCommand =
      packageManager === "yarn" ? `yarn upgrade ${name}` : `npm i -D ${name}`;
    return { ...details, updateCommand, packageManager };
  } catch (e) {
    return { err: e };
  }
}
