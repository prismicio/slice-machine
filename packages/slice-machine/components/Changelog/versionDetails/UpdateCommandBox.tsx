import React from "react";
import { Button, Flex, Text } from "theme-ui";
import { PackageChangelog, PackageVersion } from "@models/common/versions";
import { PackageManager } from "@models/common/PackageManager";
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
  const packageToInstall = `slice-machine-ui@${
    isLatest ? "latest" : selectedVersion.versionNumber
  }`;
  const updateCommand =
    packageManager === "yarn"
      ? `yarn add --dev ${packageToInstall}`
      : `npm install --save-dev ${packageToInstall}`;

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
          {updateCommand}
        </CodeBlock>

        <Button
          variant="secondary"
          onClick={() => void navigator.clipboard.writeText(updateCommand)}
        >
          Copy
        </Button>
      </Flex>
    </Flex>
  );
};
