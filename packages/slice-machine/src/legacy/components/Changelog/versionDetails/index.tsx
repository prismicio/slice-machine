import { tokens } from "@prismicio/editor-ui";
import type { PackageManager, Version } from "@slicemachine/manager";
import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { Flex, Text } from "theme-ui";

import { useSliceMachineReleaseNotes } from "@/features/changelog/useSliceMachineReleaseNotes";

import { ReleaseNotesDetails } from "./ReleaseNotesDetails";
import { UpdateCommandBox } from "./UpdateCommandBox";
import { VersionKindLabel } from "./VersionKindLabel";

interface VersionDetailsProps {
  selectedVersion: Version;
  packageManager: PackageManager;
}

export const ReleaseWarning = () => (
  <Flex sx={{ paddingLeft: "32px" }}>
    Could not fetch release notes.{" "}
    <a
      href="https://github.com/prismicio/slice-machine/releases"
      target="_blank"
      rel="noopener noreferrer"
    >
      Find out more on GitHub
    </a>
  </Flex>
);

export const VersionDetails: React.FC<VersionDetailsProps> = ({
  selectedVersion,
  packageManager,
}) => {
  const releaseNotes = useSliceMachineReleaseNotes(selectedVersion.version);

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
          {`Version ${selectedVersion.version}`}
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
        {releaseNotes?.includes("# Breaking Change") && (
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
          selectedVersion={selectedVersion}
          packageManager={packageManager}
        />

        {releaseNotes !== undefined ? (
          <ReleaseNotesDetails releaseNotes={releaseNotes} />
        ) : (
          <ReleaseWarning />
        )}
      </Flex>
    </Flex>
  );
};
