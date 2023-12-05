import { exec } from "./commandUtils";

export async function readCurrentBranchHeadTags(): Promise<Set<string>> {
  const { stdout } = await exec("git", ["tag", "--list", "--points-at"]);
  return new Set(stdout.split("\n"));
}

export async function readCurrentBranchName(): Promise<string | undefined> {
  const { stdout } = await exec("git", ["branch", "--show-current"]);
  return stdout.length > 0 ? stdout : undefined;
}

export async function readDefaultBranchName(): Promise<string | undefined> {
  const namespace = "refs/remotes/origin";
  const { stdout } = await exec("git", [
    ...["rev-parse", "--quiet", "--symbolic-full-name", "--verify"],
    `${namespace}/HEAD`,
  ]);
  return stdout.length > 0 ? stdout.replace(`${namespace}/`, "") : undefined;
}
