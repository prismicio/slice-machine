import chalk from "chalk";
import mri from "mri";
import type SemVer from "semver/classes/semver";
import semverInc from "semver/functions/inc";
import semverParse from "semver/functions/parse";

import {
  CommandError,
  exec,
  handleUncaughtException,
} from "./utils/commandUtils";
import {
  readCurrentBranchHeadTags,
  readCurrentBranchName,
} from "./utils/gitUtils";
import {
  fetchPackageVersionHistory,
  readNonPrivateWorkspaceNames,
  readPackageVersion,
} from "./utils/packageManagerUtils";

publish();

type Options = { defaultBranchName?: string };

async function publish(options?: Options): Promise<void> {
  process.on("uncaughtException", handleUncaughtException);

  const defaultBranchName = options?.defaultBranchName ?? "main";

  // Parse the command-line arguments.
  const args = mri<{ "dry-run": boolean; "tolerate-republish": boolean }>(
    process.argv.slice(2),
    {
      alias: { n: "dry-run" },
      boolean: ["dry-run", "tolerate-republish"],
      default: { "dry-run": false, "tolerate-republish": false },
    },
  );
  const dryRun = args["dry-run"];

  // Validate the release mode and number of package specifiers.
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

  // If running in stable mode, parse the package specifiers.
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

  // Ensure the repository is clean and validate the current branch name.
  const { stdout: gitStatus } = await exec("git", ["status", "--porcelain"]);
  if (gitStatus.length > 0) {
    throw new CommandError(
      "This command must be executed on a clean repository.",
    );
  }
  const currentBranchName = await readCurrentBranchName();
  if (currentBranchName === undefined) {
    throw new CommandError(
      "The HEAD must not be detached to create a release.",
    );
  } else if (
    !/^(?![A-F0-9]{40}$|refs\/)[A-Za-z][\w.\-/]*$/.test(currentBranchName)
  ) {
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

  // Fetch the version history of each package that is part of the release.
  console.log("🎣 Fetching version history...");
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

  // If running in unstable mode, format the prerelease identifier.
  const maturityLevel = isOnDefaultBranch ? "beta" : "alpha";
  const sanitizedCurrentBranchName = currentBranchName.replace(/[._/]/g, "-");
  const prereleaseIdentifier = isOnDefaultBranch
    ? maturityLevel
    : `${maturityLevel}.${sanitizedCurrentBranchName}`;

  // Calculate the new version of each package that is part of the release.
  const s = packageNames.length > 1 ? "s" : "";
  console.log(`🔍 Calculating new version${s}...`);
  let packageNameToReleaseVersion: Map<string, string>;
  if (packageNameToVersionOrReleaseType !== undefined) {
    // We're creating a stable release, so we only need to use the specified
    // versions or increments.
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
    // We're creating an unstable release, so for each package, we need to:
    // 1. Let search version be the package version, incremented by the
    //    prerelease identifier (with a prerelease number set to `1`).
    // 2. Browse the version history to find the highest published version that
    //    differs with the search version only by the prerelease number, then:
    //    - If there's a matching published version, increment its prerelease
    //      number and use the resulting version.
    //    - Otherwise, use the search version as is.
    const packageNameToTaggedVersion = new Map(
      [...(await readCurrentBranchHeadTags())]
        .map(parsePackageVersionSpecifier)
        .filter(isDefined),
    );
    packageNameToReleaseVersion = new Map(
      await Promise.all(
        packageNames.map(async (packageName) => {
          const taggedVersion = packageNameToTaggedVersion.get(packageName);
          if (taggedVersion !== undefined) {
            // There's no need to increment the prerelease number if the HEAD
            // already has a tagged version.
            return [packageName, taggedVersion] as const;
          }
          const packageVersion = await readPackageVersion(packageName);
          const parsedPackageVersion = semverParse(packageVersion);
          const parsedSearchVersion = semverParse(packageVersion);
          if (parsedPackageVersion === null || parsedSearchVersion === null) {
            throw new CommandError(
              formatInvalidPackageVersionError(packageName, packageVersion),
            );
          }
          const highestPublishedPrereleaseNumber =
            findHighestPublishedPrereleaseNumber(
              [...(packageNameToVersionHistory.get(packageName) ?? [])],
              parsedSearchVersion.inc("prerelease", prereleaseIdentifier),
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

  // Ensure the new versions aren't already in use.
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

  // Update the manifest of each package that is part of the release.
  console.log(`✏️  Updating manifest${s}...`);
  for (const nonPrivateWorkspaceName of nonPrivateWorkspaceNames) {
    const nonPrivateWorkspaceReleaseVersion = packageNameToReleaseVersion.get(
      nonPrivateWorkspaceName,
    );
    await exec(
      "yarn",
      [
        ...["workspace", nonPrivateWorkspaceName],
        ...["version", nonPrivateWorkspaceReleaseVersion ?? "decline"],
        "--deferred",
      ],
      { dryRun },
    );
  }
  await exec("yarn", ["version", "apply", "--all"], { dryRun });

  // If running in stable mode, both commit and tag the changes.
  if (mode === "stable") {
    console.log(`🏷️  "Committing changes...`);
    const { stdout: gitDiff } = await exec("git", ["diff", "--name-only"]);
    if (gitDiff.length === 0 && !dryRun) {
      throw new CommandError(
        "There are no changed package versions to commit or tag.",
      );
    } else {
      const commitMessage = `release: ${packageNameToReleaseVersion.size} new package${s}`;
      await exec("git", ["commit", "--all", "--message", commitMessage], {
        dryRun,
      });
    }
    for (const [
      packageName,
      packageReleaseVersion,
    ] of packageNameToReleaseVersion) {
      const gitTagName = `${packageName}@${packageReleaseVersion}`;
      await exec(
        "git",
        ["tag", "--annotate", "--force", "--message", packageName, gitTagName],
        { dryRun },
      );
    }

    // Push the changes to GitHub.
    console.log("🐱 Pushing to GitHub...");
    await exec("git", ["push", "--atomic", "--follow-tags"], { dryRun });
  }

  // Publish the packages that are part of the release, both in parallel and in
  // topological order.
  console.log("📦 Packing and publishing to npm...");
  const npmDistributionTag =
    mode === "stable" ? "latest" : prereleaseIdentifier;
  await exec(
    "yarn",
    [
      ...["workspaces", "foreach", "--all"],
      "--include",
      `{${[...packageNameToReleaseVersion.keys()].join(",")}}`,
      ...["--no-private", "--parallel", "--topological-dev"],
      ...["npm", "publish"],
      ...["--tag", npmDistributionTag],
      ...(args["tolerate-republish"] ? ["--tolerate-republish"] : []),
    ],
    { dryRun },
  );

  // Reset the index and working tree.
  console.log("🧹 Cleaning...");
  await exec("git", ["reset", "--hard"], { dryRun });

  // Everything went well.
  if (dryRun) {
    console.log("This was a dry run.");
  } else {
    const successMessage = `Successfully published ${packageNameToReleaseVersion.size} new package${s}.`;
    console.log(chalk.green(successMessage));
  }

  process.off("uncaughtException", handleUncaughtException);
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

function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function findHighestPublishedPrereleaseNumber(
  packageVersionHistory: string[],
  parsedSearchVersion: SemVer,
): number | undefined {
  const searchPrereleaseIdentifier =
    formatPrereleaseIdentifier(parsedSearchVersion);
  return packageVersionHistory.reduce(
    (prevHighestPublishedPrereleaseNumber, publishedVersion) => {
      const parsedPublishedVersion = semverParse(publishedVersion);
      if (
        parsedPublishedVersion?.compareMain(parsedSearchVersion) !== 0 ||
        formatPrereleaseIdentifier(parsedPublishedVersion) !==
          searchPrereleaseIdentifier
      ) {
        // Either the main parts or the prerelease identifiers are different.
        return prevHighestPublishedPrereleaseNumber;
      }
      // `publishedPrereleaseNumber` is the last element of the
      // `parsedPublishedVersion.prerelease` array.
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

function formatPrereleaseIdentifier(parsedVersion: SemVer): string {
  return parsedVersion.prerelease.slice(0, -1).join(".");
}

function incrementVersionByPrerelease(
  parsedVersion: SemVer,
  prereleaseIdentifier: string,
  prereleaseNumber: number | undefined,
): string {
  const incrementedParsedVersionPatch =
    parsedVersion.patch + (parsedVersion.prerelease.length > 0 ? 0 : 1);
  const incrementedPrereleaseNumber = (prereleaseNumber ?? 0) + 1;
  return `${parsedVersion.major}.${parsedVersion.minor}.${incrementedParsedVersionPatch}-${prereleaseIdentifier}.${incrementedPrereleaseNumber}`;
}
