import React from "react";
import { Flex, Text } from "theme-ui";
import { PackageChangelog, PackageVersion } from "@models/common/versions";
import { PackageManager } from "@models/common/PackageManager";
import { VersionKindLabel } from "./VersionKindLabel";
import { ReleaseNoteDetails } from "./ReleaseNoteDetails";
import { UpdateCommandBox } from "./UpdateCommandBox";
import { AiFillWarning } from "react-icons/ai";

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
          margin: "24px 32px",
          gap: "24px",
        }}
      >
        {selectedVersion.releaseNote?.includes("# Breaking Change") && (
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
            data-testid="breaking-changes-warning"
          >
            <AiFillWarning size="24px" />
            This update includes breaking changes. To update correctly, follow
            the steps below.
          </Flex>
        )}

        <UpdateCommandBox
          changelog={changelog}
          selectedVersion={selectedVersion}
          packageManager={packageManager}
        />

        {selectedVersion.releaseNote && (
          <ReleaseNoteDetails releaseNote={selectedVersion.releaseNote} />
        )}
      </Flex>
    </Flex>
  );
};
