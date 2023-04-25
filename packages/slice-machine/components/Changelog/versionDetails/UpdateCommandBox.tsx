import React from "react";
import { Button, Flex, Text } from "theme-ui";
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
  const isLatest =
    selectedVersion.versionNumber === changelog.versions[0].versionNumber;
  const version = isLatest ? "latest" : selectedVersion.versionNumber;
  const packageSpec = `slice-machine-ui@${version}`;
  const installCommand = getInstallCommand(packageManager, packageSpec);

  return (
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
          codeStyle={{ color: "white", minWidth: "480px", padding: "8px" }}
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
  );
};

function getInstallCommand(
  packageManager: PackageManager,
  packageSpec: string
): string {
  switch (packageManager) {
    case "bun":
      return `bun add --development ${packageSpec}`;
    case "npm":
      return `npm install --save-dev ${packageSpec}`;
    case "pnpm":
    case "pnpm@6":
      return `pnpm add --save-dev ${packageSpec}`;
    case "yarn":
    case "yarn@berry":
      return `yarn add --dev ${packageSpec}`;
  }
}
