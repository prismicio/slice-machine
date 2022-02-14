import React from "react";
import { Flex, Text, Button } from "theme-ui";
import { PackageVersion, PackageChangelog } from "@models/common/versions";
import { PackageManager } from "@models/common/PackageManager";
import CodeBlock from "@components/CodeBlock";
import { marked } from "marked";

interface VersionDetailsProps {
  changelog: PackageChangelog;
  selectedVersion: PackageVersion;
  packageManager: PackageManager;
}

export const VersionDetails: React.FC<VersionDetailsProps> = ({
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
        width: "650px",
        minWidth: "650px",
        height: "100%",
        borderRight: "1px solid",
        borderColor: "grey01",
        flexDirection: "column",
      }}
    >
      <Flex
        sx={{
          padding: "32px",
          borderBottom: "1px solid",
          borderColor: "grey01",
          justifyContent: "space-between",
        }}
      >
        <Text
          sx={{
            fontSize: "24px",
            fontWeight: 600,
            lineHeight: "32px",
          }}
        >
          {`Version ${selectedVersion.versionNumber}`}
        </Text>
      </Flex>

      <Flex
        sx={{
          flexDirection: "column",
          padding: "24px 32px",
          gap: "24px",
        }}
      >
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
              onClick={() => navigator.clipboard.writeText(updateCommand)}
            >
              Copy
            </Button>
          </Flex>
        </Flex>

        {selectedVersion.releaseNote ? (
          <Flex
            sx={{
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Text
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "32px",
              }}
            >
              What's new
            </Text>

            <Text
              dangerouslySetInnerHTML={{
                __html: marked.parse(selectedVersion.releaseNote),
              }}
            />
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
};
