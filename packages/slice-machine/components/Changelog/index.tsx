import { Flex, Text } from "theme-ui";
import { transparentize } from "@theme-ui/color";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getUpdateVersionInfo } from "@src/modules/environment";
import { useState } from "react";
import { SliceMachineVersion } from "@lib/env/semver";

function findLatestNonBreaking(
  currentVersion: string,
  versions: SliceMachineVersion[]
) {
  return versions[1].version;
}

export default function Changelog() {
  const { updateVersion } = useSelector((store: SliceMachineStoreType) => ({
    updateVersion: getUpdateVersionInfo(store),
  }));

  // Null is when no version are found (edge case)
  const [selectedVersion, setSelectedVersion] =
    useState<SliceMachineVersion | null>(
      updateVersion.availableVersions[0] || null
    );

  const latestVersion: string | undefined =
    updateVersion.availableVersions[0].version;
  const latestNonBreakingVersion: string | undefined = findLatestNonBreaking(
    updateVersion.currentVersion,
    updateVersion.availableVersions
  );

  function findVersionTag(versionNumber: string): VersionTags | null {
    switch (versionNumber) {
      case latestVersion:
        return VersionTags.Latest;
      case latestNonBreakingVersion:
        return VersionTags.LatestNonBreaking;
      case updateVersion.currentVersion:
        return VersionTags.Current;
      default:
        return null;
    }
  }

  return (
    <Flex
      sx={{
        maxWidth: "1224px",
      }}
    >
      <Flex
        sx={{
          width: "244px",
          height: "100%",
          borderRight: "1px solid #F3F5F7",
          flexDirection: "column",
          padding: "32px 48px 0px 16px",
        }}
      >
        <Flex
          sx={{
            flexDirection: "column",
            borderBottom: "1px solid #F3F5F7",
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
          {updateVersion.availableVersions.map((availableVersion) => (
            <VersionBadge
              isSelected={selectedVersion?.version === availableVersion.version}
              onClick={() => {
                setSelectedVersion(availableVersion);
              }}
              versionNumber={availableVersion.version}
              tag={findVersionTag(availableVersion.version)}
            />
          ))}
        </Flex>
      </Flex>

      <Flex>{selectedVersion?.version}</Flex>
    </Flex>
  );
}

enum VersionTags {
  Latest = "LATEST",
  LatestNonBreaking = "LATEST-NON-BREAKING",
  Current = "CURRENT",
}

interface VersionBadgeProps {
  isSelected: boolean;
  onClick: () => void;
  versionNumber: string;
  tag: VersionTags | null;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  isSelected,
  onClick,
  versionNumber,
  tag,
}) => {
  return (
    <Flex
      sx={{
        p: 1,
        borderRadius: "4px",
        cursor: "pointer",
        transition: "200ms all",
        justifyContent: "space-between",
        alignItems: "center",
        ...(!isSelected
          ? {
              "&:hover": {
                bg: "grey01",
              },
            }
          : {
              color: "purple",
              bg: transparentize("purple", 0.95),
            }),
      }}
      onClick={onClick}
    >
      <Text>{versionNumber}</Text>
      {tag && <VersionTag type={tag} />}
    </Flex>
  );
};

interface VersionTagProps {
  type: VersionTags;
}

export const VersionTag: React.FC<VersionTagProps> = ({ type }) => (
  <Text
    sx={{
      padding: "0px 4px",
      borderRadius: "2px",
      fontSize: "8px",
      fontWeight: 600,
      lineHeight: "16px",
      textTransform: "uppercase",
      ...((type === VersionTags.Latest ||
        type === VersionTags.LatestNonBreaking) && {
        bg: "grey02",
        color: "code.gray",
      }),
      ...(type === VersionTags.Current && {
        bg: "lightGreen",
        color: "code.green",
      }),
    }}
  >
    {type}
  </Text>
);
