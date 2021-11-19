import path from "path";
import semver from "semver";
import fs from "fs";
import fetch, { Response } from "node-fetch";
import {
  name as packageName,
  version as installedVersion,
} from "../../../package.json";

export class HTTPResponseError extends Error {
  response: Response;
  constructor(response: Response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

interface PackageJson extends Record<string, unknown> {
  version: string;
}

export function getRemotePackage(): Promise<PackageJson> {
  const url = `https://unpkg.com/${packageName}/package.json`;
  return fetch(url).then((res) => {
    if (Math.floor(res.status / 100) === 2) {
      return res.json() as unknown as PackageJson;
    }
    throw new HTTPResponseError(res);
  });
}

export function hasYarn() {
  // could use lookpath to check yarn is installed as well ?
  return fs.existsSync(path.join(process.cwd(), "yarn.lock"));
}

export async function checkVersion(): Promise<{
  update: boolean;
  current: string;
  recent: string;
}> {
  const { version: remoteVersion } = await getRemotePackage();
  const update = semver.lt(installedVersion, remoteVersion);
  return {
    current: installedVersion,
    recent: remoteVersion,
    update,
  };
}

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
      packageManager === "yarn"
        ? `yarn upgrade ${packageName}`
        : `npm i -D ${packageName}`;
    return { ...details, updateCommand, packageManager };
  } catch (e) {
    return { err: e };
  }
}
