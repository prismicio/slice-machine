import type { PackageManager, Version } from "@slicemachine/manager";
import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { Button, Flex, Text } from "theme-ui";

import { useSliceMachineVersions } from "@/features/changelog/useSliceMachineVersions";
import { useAdapterName } from "@/hooks/useAdapterName";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";
import CodeBlock from "@/legacy/components/CodeBlock";

interface UpdateCommandBoxProps {
  selectedVersion: Version;
  packageManager: PackageManager;
}

export const UpdateCommandBox: React.FC<UpdateCommandBoxProps> = ({
  selectedVersion,
  packageManager,
}) => {
  const versions = useSliceMachineVersions();
  const adapterName = useAdapterName();
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  const isLatestSliceMachineVersion =
    selectedVersion.version === versions[0].version;
  const sliceMachineVersionToInstall = isLatestSliceMachineVersion
    ? "latest"
    : selectedVersion.version;
  const packagesSpecs = getPackagesSpecs({
    sliceMachineVersionToInstall,
    isLatestSliceMachineVersion,
    adapterName,
  });
  const installCommand = getInstallCommand(packageManager, packagesSpecs);
  const isOnlyAdapterUpdate =
    adapterUpdateAvailable && !sliceMachineUpdateAvailable;

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
  packagesSpecs: string[],
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
