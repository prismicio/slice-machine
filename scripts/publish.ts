import chalk from "chalk";
import { $ } from "execa";
import mri from "mri";
import type SemVer from "semver/classes/semver";
import semverInc from "semver/functions/inc";
import semverParse from "semver/functions/parse";

class CommandError extends Error {
  constructor(message: string) {
    super(message);
  }
}

publish();

type Options = { defaultBranchName?: string };

async function publish(options?: Options): Promise<void> {
  process.on("uncaughtException", handleUncaughtException);

  const defaultBranchName = options?.defaultBranchName ?? "main";

  const args = mri<{ "dry-run": boolean; "tolerate-republish": boolean }>(
    process.argv.slice(2),
    {
      alias: { n: "dry-run" },
      boolean: ["dry-run", "tolerate-republish"],
      default: { "dry-run": false, "tolerate-republish": false },
    },
  );

  const mode = args._[0];
  if (mode !== "stable" && mode !== "unstable") {
    throw new CommandError(
      "The first argument must be either `stable` or `unstable`.",
    );
  }
  const specifiers = args._.slice(1);
  if (mode === "stable" && specifiers.length === 0) {
    throw new CommandError(
      "At least one package version or increment must be specified (using either the `<name>@<version>` or the `<name>:(major|minor|patch)` format) to create a stable release.",
    );
  } else if (mode === "unstable" && specifiers.length > 0) {
    throw new CommandError(
      "Package versions or increments cannot be specified when creating an unstable release.",
    );
  }

  const nonPrivateWorkspaceNames = await readNonPrivateWorkspaceNames();
  let packageNameToVersionOrReleaseType: Map<string, string> | undefined;
  if (mode === "stable") {
    packageNameToVersionOrReleaseType = new Map(
      specifiers.map((specifier) => {
        let parsedSpecifier = parsePackageReleaseTypeSpecifier(specifier);
        if (parsedSpecifier !== undefined) {
          const [packageName, packageReleaseType] = parsedSpecifier;
          validatePackageName(packageName, specifier);
          if (!isReleaseType(packageReleaseType)) {
            throw new CommandError(
              `Invalid package specifier: \`${specifier}\`. Increment \`${packageReleaseType}\` must be one of \`major\`, \`minor\` or \`patch\`.`,
            );
          }
          return [packageName, packageReleaseType];
        }
        parsedSpecifier = parsePackageVersionSpecifier(specifier);
        if (parsedSpecifier !== undefined) {
          const [packageName, packageVersion] = parsedSpecifier;
          validatePackageName(packageName, specifier);
          const parsedPackageVersion = semverParse(packageVersion);
          if (parsedPackageVersion === null) {
            throw new CommandError(
              `Invalid package specifier: \`${specifier}\`. Version \`${packageVersion}\` must be a valid SemVer string.`,
            );
          } else if (parsedPackageVersion.prerelease.length > 0) {
            throw new CommandError(
              `Invalid package specifier: \`${specifier}\`. Version \`${parsedPackageVersion}\` must not include any prerelease component.`,
            );
          }
          return [packageName, parsedPackageVersion.version];
        }
        throw new CommandError(
          `Invalid package specifier: \`${specifier}\`. You must use either the \`<name>@<version>\` or the \`<name>:(major|minor|patch)\` format.`,
        );
      }),
    );
    function validatePackageName(packageName: string, specifier: string): void {
      if (!nonPrivateWorkspaceNames.has(packageName)) {
        throw new CommandError(
          `Invalid package specifier: \`${specifier}\`. Package \`${packageName}\` must be a non-private workspace.`,
        );
      }
    }
  }

  const { stdout: gitStatus } = await $`git status --porcelain`;
  if (gitStatus.length > 0) {
    throw new CommandError(
      "This command must be executed on a clean repository.",
    );
  }
  const { stdout: currentBranchName } = await $`git branch --show-current`;
  if (!/^(?![A-F0-9]{40}$|refs\/)[A-Za-z][\w.\-/]*$/.test(currentBranchName)) {
    throw new CommandError(
      `Invalid current branch name: \`${currentBranchName}\`. It must use GitHub's safe set of characters (see https://docs.github.com/en/get-started/using-git/dealing-with-special-characters-in-branch-and-tag-names#naming-branches-and-tags).`,
    );
  }
  const isOnDefaultBranch = currentBranchName === defaultBranchName;
  if (mode === "stable" && !isOnDefaultBranch) {
    throw new CommandError(
      `You must be on the \`${defaultBranchName}\` branch to create a stable release.`,
    );
  }

  const packageNames = [
    ...(packageNameToVersionOrReleaseType !== undefined
      ? packageNameToVersionOrReleaseType.keys()
      : nonPrivateWorkspaceNames),
  ];
  const packageNameToVersionHistory = new Map(
    await Promise.all(
      packageNames.map(
        async (packageName) =>
          [packageName, await fetchPackageVersionHistory(packageName)] as const,
      ),
    ),
  );

  const maturityLevel = isOnDefaultBranch ? "beta" : "alpha";
  const sanitizedCurrentBranchName = currentBranchName.replace("._/", "-");
  let packageNameToReleaseVersion: Map<string, string>;
  if (packageNameToVersionOrReleaseType !== undefined) {
    packageNameToReleaseVersion = new Map(
      await Promise.all(
        [...packageNameToVersionOrReleaseType].map(
          async ([packageName, packageVersionOrReleaseType]) => {
            if (isReleaseType(packageVersionOrReleaseType)) {
              const packageVersion = await readPackageVersion(packageName);
              const incrementedPackageVersion = semverInc(
                packageVersion,
                packageVersionOrReleaseType,
              );
              if (incrementedPackageVersion === null) {
                throw new CommandError(
                  formatInvalidPackageVersionError(packageName, packageVersion),
                );
              }
              return [packageName, incrementedPackageVersion] as const;
            } else {
              return [packageName, packageVersionOrReleaseType] as const;
            }
          },
        ),
      ),
    );
  } else {
    const packageNameToTaggedVersion = new Map(
      [...(await readCurrentBranchHeadTags())]
        .map(parsePackageVersionSpecifier)
        .filter(isDefined),
    );
    const prereleaseIdentifier = isOnDefaultBranch
      ? maturityLevel
      : `${maturityLevel}.${sanitizedCurrentBranchName}`;
    packageNameToReleaseVersion = new Map(
      await Promise.all(
        packageNames.map(async (packageName) => {
          const taggedVersion = packageNameToTaggedVersion.get(packageName);
          if (taggedVersion !== undefined) {
            return [packageName, taggedVersion] as const;
          }
          const packageVersion = await readPackageVersion(packageName);
          const parsedPackageVersion = semverParse(packageVersion);
          if (parsedPackageVersion === null) {
            throw new CommandError(
              formatInvalidPackageVersionError(packageName, packageVersion),
            );
          }
          const highestPublishedPrereleaseNumber =
            findHighestPublishedPrereleaseNumber(
              [...(packageNameToVersionHistory.get(packageName) ?? [])],
              parsedPackageVersion,
              prereleaseIdentifier,
            );
          const incrementedPackageVersion = incrementVersionByPrerelease(
            parsedPackageVersion,
            prereleaseIdentifier,
            highestPublishedPrereleaseNumber,
          );
          return [packageName, incrementedPackageVersion] as const;
        }),
      ),
    );
  }
  function formatInvalidPackageVersionError(
    packageName: string,
    packageVersion: string,
  ): string {
    return `Package \`${packageName}\` has an invalid version \`${packageVersion}\` in its manifest.`;
  }

  if (!args["tolerate-republish"]) {
    packageNameToReleaseVersion.forEach(
      (packageReleaseVersion, packageName) => {
        const packageVersionHistory =
          packageNameToVersionHistory.get(packageName);
        if (packageVersionHistory?.has(packageReleaseVersion)) {
          throw new CommandError(
            `Package \`${packageName}@${packageReleaseVersion}\` has already been published.`,
          );
        }
      },
    );
  }

  for (const nonPrivateWorkspaceName of nonPrivateWorkspaceNames) {
    const nonPrivateWorkspaceReleaseVersion = packageNameToReleaseVersion.get(
      nonPrivateWorkspaceName,
    );
    await $`yarn workspace ${nonPrivateWorkspaceName} version ${
      nonPrivateWorkspaceReleaseVersion ?? "decline"
    } --deferred`;
  }
  await $`yarn version apply --all`;

  const { stdout: gitDiff } = await $`git diff --name-only`;
  if (gitDiff.length === 0) {
    throw new CommandError(
      "There are no changed package versions to commit or tag.",
    );
  } else if (mode === "stable") {
    const s = packageNameToReleaseVersion.size > 1 ? "s" : "";
    const commitMessage = `release: ${packageNameToReleaseVersion.size} new package${s}`;
    await $`git commit --all --message ${commitMessage}`;
  }
  for (const [
    packageName,
    packageReleaseVersion,
  ] of packageNameToReleaseVersion) {
    const gitTagName = `${packageName}@${packageReleaseVersion}`;
    await $`git tag --annotate --force --message ${packageName} ${gitTagName}`;
  }

  await $`git push --atomic --follow-tags`;

  let npmDistributionTag: string;
  if (mode === "stable") {
    npmDistributionTag = "latest";
  } else {
    npmDistributionTag = isOnDefaultBranch
      ? maturityLevel
      : `${maturityLevel}+${sanitizedCurrentBranchName}`;
  }
  await $`yarn workspaces foreach --all --include ${[
    [...packageNameToReleaseVersion.keys()].join(","),
  ]} --no-private --parallel --topological-dev npm publish --access public --tag ${npmDistributionTag} ${
    args["tolerate-republish"] ? "--tolerate-republish" : ""
  }`;

  process.off("uncaughtException", handleUncaughtException);
}

function handleUncaughtException(error: Error): void {
  if (error instanceof CommandError) {
    console.error(chalk.stderr.red(error.message));
    process.exitCode = 1;
  } else {
    console.error(error);
    process.exitCode = 2;
  }
}

async function readNonPrivateWorkspaceNames(): Promise<Set<string>> {
  const { stdout } = await $`yarn workspaces list --json --no-private`;
  return new Set(
    stdout
      .split("\n")
      .map((line) => (JSON.parse(line) as { name: string }).name),
  );
}

function parsePackageReleaseTypeSpecifier(
  specifier: string,
): [name: string, releaseType: string] | undefined {
  const groups = specifier.match(/^(?<name>\S+):(?<releaseType>\S+)$/)?.groups;
  return groups?.name !== undefined && groups.releaseType !== undefined
    ? [groups.name, groups.releaseType]
    : undefined;
}

function isReleaseType(value: unknown): value is "major" | "minor" | "patch" {
  return value === "major" || value === "minor" || value === "patch";
}

function parsePackageVersionSpecifier(
  specifier: string,
): [name: string, version: string] | undefined {
  const groups = specifier.match(/^(?<name>\S+)@(?<version>\S+)$/)?.groups;
  return groups?.name !== undefined && groups.version !== undefined
    ? [groups.name, groups.version]
    : undefined;
}

async function fetchPackageVersionHistory(name: string): Promise<Set<string>> {
  try {
    const { stdout } = await $`yarn npm info ${name} --fields versions --json`;
    return new Set((JSON.parse(stdout) as { versions: string[] }).versions);
  } catch (error) {
    if (
      error instanceof Error &&
      "stdout" in error &&
      typeof error.stdout === "string" &&
      error.stdout.includes("Response Code: 404 (Not Found)")
    ) {
      // The package has never been published.
      return new Set();
    }
    throw error;
  }
}

async function readPackageVersion(name: string): Promise<string> {
  const { stdout } = await $`yarn info ${name} --all --json`;
  return (JSON.parse(stdout) as { children: { Version: string } }).children
    .Version;
}

async function readCurrentBranchHeadTags(): Promise<Set<string>> {
  const { stdout } = await $`git tag --list --points-at`;
  return new Set(stdout.split("\n"));
}

function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function findHighestPublishedPrereleaseNumber(
  packageVersionHistory: string[],
  parsedPackageVersion: SemVer,
  prereleaseIdentifier: string,
): number | undefined {
  return packageVersionHistory.reduce(
    (prevHighestPublishedPrereleaseNumber, publishedVersion) => {
      const parsedPublishedVersion = semverParse(publishedVersion);
      if (
        parsedPublishedVersion?.compareMain(parsedPackageVersion) !== 0 ||
        parsedPublishedVersion.prerelease.slice(0, -1).join(".") !==
          prereleaseIdentifier
      ) {
        return prevHighestPublishedPrereleaseNumber;
      }
      const [publishedPrereleaseNumber] =
        parsedPublishedVersion.prerelease.slice(-1);
      return typeof publishedPrereleaseNumber === "number" &&
        publishedPrereleaseNumber >=
          (prevHighestPublishedPrereleaseNumber ?? Number.MIN_SAFE_INTEGER)
        ? publishedPrereleaseNumber
        : prevHighestPublishedPrereleaseNumber;
    },
    undefined as number | undefined,
  );
}

function incrementVersionByPrerelease(
  parsedVersion: SemVer,
  prereleaseIdentifier: string,
  prereleaseNumber: number | undefined,
): string {
  if (prereleaseNumber === undefined) {
    return `${parsedVersion.inc("patch")}-${prereleaseIdentifier}.1`;
  } else {
    const incrementedPrereleaseNumber = ++prereleaseNumber;
    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}-${prereleaseIdentifier}.${incrementedPrereleaseNumber}`;
  }
}
