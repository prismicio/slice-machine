import React from "react";
import { Flex, Text } from "theme-ui";
import { PackageChangelog, PackageVersion } from "@models/common/versions";
import { PackageManager } from "@models/common/PackageManager";
import { VersionKindLabel } from "./VersionKindLabel";
import { ReleaseNoteDetails } from "./ReleaseNoteDetails";
import { UpdateCommandBox } from "./UpdateCommandBox";

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
  return (
    <Flex
      sx={{
        width: "650px",
        minWidth: "650px",
        height: "100%",
        borderRight: "1px solid",
        borderColor: "grey01",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Flex
        sx={{
          padding: "32px",
          borderBottom: "1px solid",
          borderColor: "grey01",
          justifyContent: "space-between",
          alignItems: "center",
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
        {!!selectedVersion.kind && (
          <VersionKindLabel versionKind={selectedVersion.kind} />
        )}
      </Flex>
      <Flex
        sx={{
          flexDirection: "column",
          padding: "24px 32px",
          gap: "24px",
        }}
      >
        <UpdateCommandBox
          changelog={changelog}
          selectedVersion={selectedVersion}
          packageManager={packageManager}
        />

        {selectedVersion.releaseNote ? (
          <ReleaseNoteDetails releaseNote={selectedVersion.releaseNote} />
        ) : null}
      </Flex>
    </Flex>
  );
};
