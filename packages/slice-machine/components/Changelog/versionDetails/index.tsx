import { tokens } from "@prismicio/editor-ui";
import React from "react";
import { Flex, Text } from "theme-ui";
import type { PackageManager } from "@slicemachine/manager";
import { PackageChangelog, PackageVersion } from "@models/common/versions";
import { VersionKindLabel } from "./VersionKindLabel";
import { ReleaseNoteDetails } from "./ReleaseNoteDetails";
import { UpdateCommandBox } from "./UpdateCommandBox";
import { AiFillWarning } from "react-icons/ai";

interface VersionDetailsProps {
  changelog: PackageChangelog;
  selectedVersion: PackageVersion;
  packageManager: PackageManager;
}

export const ReleaseWarning = () => (
  <div>
    Could not fetch release notes.{" "}
    <a
      href="https://github.com/prismicio/slice-machine/releases"
      target="_blank"
      rel="noopener noreferrer"
    >
      Find out more on GitHub
    </a>
  </div>
);

export const VersionDetails: React.FC<VersionDetailsProps> = ({
  changelog,
  selectedVersion,
  packageManager,
}) => {
  return (
    <Flex sx={{ flexDirection: "column" }}>
      <Flex
        sx={{
          padding: "0px 0px 32px 32px",
          borderBottom: "1px dashed",
          borderColor: tokens.color.greyLight6,
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
          padding: "24px 0px 0px 32px",
          gap: "24px",
        }}
      >
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
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
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {selectedVersion?.releaseNote ? (
          <ReleaseNoteDetails releaseNote={selectedVersion.releaseNote} />
        ) : (
          <ReleaseWarning />
        )}
      </Flex>
    </Flex>
  );
};
