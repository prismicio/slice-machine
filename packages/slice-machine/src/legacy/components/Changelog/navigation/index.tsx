import { theme } from "@prismicio/editor-ui";
import { Version } from "@slicemachine/manager";
import React from "react";
import { Flex, Text } from "theme-ui";

import { useSliceMachineLatestNonBreakingVersion } from "@/features/changelog/useSliceMachineLatestNonBreakingVersion";
import { useSliceMachineVersions } from "@/features/changelog/useSliceMachineVersions";
import { useSliceMachineRunningVersion } from "@/hooks/useSliceMachineRunningVersion";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

import { VersionBadge } from "./VersionBadge";

export enum VersionTags {
  Latest = "LATEST",
  LatestNonBreaking = "LATEST-NON-BREAKING",
  Current = "CURRENT",
}

interface NavigationProps {
  selectedVersion: Version | undefined;
  selectVersion: (version: Version) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  selectedVersion,
  selectVersion,
}) => {
  const versions = useSliceMachineVersions();
  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();
  const latestNonBreakingVersion = useSliceMachineLatestNonBreakingVersion();
  const runningVersion = useSliceMachineRunningVersion();

  const latestVersion: string | undefined = versions[0]?.version;

  function findVersionTags(versionNumber: string): VersionTags[] {
    const tags = [];

    // Display Latest or LatestNonBreaking tag
    if (versionNumber === latestVersion) {
      tags.push(VersionTags.Latest);
    } else if (versionNumber === latestNonBreakingVersion) {
      tags.push(VersionTags.LatestNonBreaking);
    }

    // Display Current tag
    if (versionNumber === runningVersion) {
      tags.push(VersionTags.Current);
    }

    return tags;
  }

  return (
    <Flex
      sx={{
        minWidth: "228px",
        borderRight: "1px dashed",
        borderColor: theme.color.grey6,
        flexDirection: "column",
        paddingRight: "48px",
      }}
    >
      <Flex
        sx={{
          flexDirection: "column",
          borderBottom: "1px dashed",
          borderColor: theme.color.grey6,
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
        {versions.map((packageVersion, index) => (
          <VersionBadge
            key={`versionBadge-${packageVersion.version}-${index}`}
            isSelected={selectedVersion?.version === packageVersion.version}
            onClick={() => selectVersion(packageVersion)}
            versionNumber={packageVersion.version}
            tags={findVersionTags(packageVersion.version)}
            hasUpToDateVersions={
              !sliceMachineUpdateAvailable && !adapterUpdateAvailable
            }
          />
        ))}
      </Flex>
    </Flex>
  );
};
