import React from "react";
import { Button, Flex, Text } from "theme-ui";
import { AiFillWarning } from "react-icons/ai";
import type { PackageManager } from "@slicemachine/manager";
import { PackageChangelog, PackageVersion } from "@models/common/versions";
import CodeBlock from "@components/CodeBlock";

interface UpdateCommandBoxProps {
  changelog: PackageChangelog;
  selectedVersion: PackageVersion;
  packageManager: PackageManager;
}

export const UpdateCommandBox: React.FC<UpdateCommandBoxProps> = ({
  changelog,
  selectedVersion,
  packageManager,
}) => {
  const isLatestSliceMachineVersion =
    selectedVersion.versionNumber ===
    changelog.sliceMachine.versions[0].versionNumber;
  const sliceMachineVersionToInstall = isLatestSliceMachineVersion
    ? "latest"
    : selectedVersion.versionNumber;
  const packagesSpecs = getPackagesSpecs({
    sliceMachineVersionToInstall,
    isLatestSliceMachineVersion,
    adapterName: changelog.adapter.name,
  });
  const installCommand = getInstallCommand(packageManager, packagesSpecs);
  const isOnlyAdapterUpdate =
    changelog.adapter.updateAvailable &&
    !changelog.sliceMachine.updateAvailable;

  return (
    <>
      {isOnlyAdapterUpdate && isLatestSliceMachineVersion && (
        <Flex
          sx={{
            padding: "16px",
            bg: "lightOrange",
            color: "darkOrange",
            fontSize: "13px",
            lineHeight: "24px",
            borderRadius: "4px",
            gap: "16px",
          }}
        >
          <AiFillWarning size="24px" />
          It looks like you are using an outdated version of the adapter. Run
          this command to update your adapter:
        </Flex>
      )}
      <Flex
        sx={{
          flexDirection: "column",
          gap: "16px",
          padding: "16px",
          bg: "grey01",
        }}
      >
        <Text
          sx={{
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "20px",
          }}
        >
          How to install
        </Text>
        <Flex
          sx={{
            gap: "8px",
          }}
        >
          <CodeBlock
            codeStyle={{ color: "white", flex: 1, padding: "8px" }}
            sx={{ flex: 1 }}
          >
            {installCommand}
          </CodeBlock>

          <Button
            variant="secondary"
            onClick={() => void navigator.clipboard.writeText(installCommand)}
          >
            Copy
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

function getInstallCommand(
  packageManager: PackageManager,
  packagesSpecs: string[]
): string {
  const packagesSpecsStr = packagesSpecs.join(" ");

  switch (packageManager) {
    case "bun":
      return `bun add --development ${packagesSpecsStr}`;
    case "npm":
      return `npm install --save-dev ${packagesSpecsStr}`;
    case "pnpm":
    case "pnpm@6":
      return `pnpm add --save-dev ${packagesSpecsStr}`;
    case "yarn":
    case "yarn@berry":
      return `yarn add --dev ${packagesSpecsStr}`;
  }
}

type GetPackagesSpecsArgs = {
  sliceMachineVersionToInstall: string;
  isLatestSliceMachineVersion: boolean;
  adapterName: string;
};

function getPackagesSpecs({
  sliceMachineVersionToInstall,
  isLatestSliceMachineVersion,
  adapterName,
}: GetPackagesSpecsArgs) {
  const packagesSpecs = [`slice-machine-ui@${sliceMachineVersionToInstall}`];

  if (isLatestSliceMachineVersion) {
    packagesSpecs.push(`${adapterName}@latest`);
  }

  return packagesSpecs;
}
