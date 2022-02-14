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
  selectedVersion: PackageVersion | null;
  selectVersion: (version: PackageVersion) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  changelog,
  selectedVersion,
  selectVersion,
}) => {
  const latestVersion: string | undefined = changelog.versions[0].versionNumber;

  function findVersionTag(versionNumber: string): VersionTags | null {
    switch (versionNumber) {
      case latestVersion:
        return VersionTags.Latest;
      case changelog.latestNonBreakingVersion:
        return VersionTags.LatestNonBreaking;
      case changelog.currentVersion:
        return VersionTags.Current;
      default:
        return null;
    }
  }

  return (
    <Flex
      sx={{
        width: "244px",
        minWidth: "244px",
        height: "100%",
        borderRight: "1px solid",
        borderColor: "grey01",
        flexDirection: "column",
        padding: "32px 48px 0px 16px",
      }}
    >
      <Flex
        sx={{
          flexDirection: "column",
          borderBottom: "1px solid",
          borderColor: "grey01",
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
        }}
      >
        {changelog.versions.map((version) => (
          <VersionBadge
            isSelected={
              selectedVersion?.versionNumber === version.versionNumber
            }
            onClick={() => selectVersion(version)}
            versionNumber={version.versionNumber}
            tag={findVersionTag(version.versionNumber)}
          />
        ))}
      </Flex>
    </Flex>
  );
};
