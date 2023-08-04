import { tokens } from "@prismicio/editor-ui";
import React from "react";
import { Flex, Text } from "theme-ui";
import { PackageChangelog, PackageVersion } from "@models/common/versions";
import { VersionBadge } from "./VersionBadge";

export enum VersionTags {
  Latest = "LATEST",
  LatestNonBreaking = "LATEST-NON-BREAKING",
  Current = "CURRENT",
}

interface NavigationProps {
  changelog: PackageChangelog;
  selectedVersion: PackageVersion | undefined;
  selectVersion: (version: PackageVersion) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  changelog,
  selectedVersion,
  selectVersion,
}) => {
  const latestVersion: string | undefined =
    changelog.sliceMachine.versions[0]?.versionNumber;
  const hasUpToDateVersions =
    !changelog.adapter.updateAvailable &&
    !changelog.sliceMachine.updateAvailable;

  function findVersionTags(versionNumber: string): VersionTags[] {
    const tags = [];

    // Display Latest or LatestNonBreaking tag
    if (versionNumber === latestVersion) {
      tags.push(VersionTags.Latest);
    } else if (
      versionNumber === changelog.sliceMachine.latestNonBreakingVersion
    ) {
      tags.push(VersionTags.LatestNonBreaking);
    }

    // Display Current tag
    if (versionNumber === changelog.sliceMachine.currentVersion) {
      tags.push(VersionTags.Current);
    }

    return tags;
  }

  return (
    <Flex
      sx={{
        minWidth: "228px",
        borderRight: "1px dashed",
        borderColor: tokens.color.greyLight6,
        flexDirection: "column",
        paddingRight: "48px",
      }}
    >
      <Flex
        sx={{
          flexDirection: "column",
          borderBottom: "1px dashed",
          borderColor: tokens.color.greyLight6,
          paddingBottom: "28px",
        }}
      >
        <Text
          sx={{
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "32px",
          }}
        >
          Changelog
        </Text>
        <Text
          sx={{
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "24px",
            marginTop: "28px",
          }}
        >
          All versions
        </Text>
      </Flex>
      <Flex
        sx={{
          mt: "24px",
          flexDirection: "column",
          gap: "4px",
          overflow: "auto",
        }}
      >
        {changelog.sliceMachine.versions.map((version, index) => (
          <VersionBadge
            key={`versionBadge-${version.versionNumber}-${index}`}
            isSelected={
              selectedVersion?.versionNumber === version.versionNumber
            }
            onClick={() => selectVersion(version)}
            versionNumber={version.versionNumber}
            tags={findVersionTags(version.versionNumber)}
            hasUpToDateVersions={hasUpToDateVersions}
          />
        ))}
      </Flex>
    </Flex>
  );
};
