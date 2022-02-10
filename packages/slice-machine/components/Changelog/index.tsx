import { Flex, Text } from "theme-ui";
import { transparentize } from "@theme-ui/color";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getUpdateVersionInfo } from "@src/modules/environment";
import { useState } from "react";
import { SliceMachineVersion } from "@lib/env/semver";

export default function Changelog() {
  const { updateVersion } = useSelector((store: SliceMachineStoreType) => ({
    updateVersion: getUpdateVersionInfo(store),
  }));

  // Null is when no version are found (edge case)
  const [selectedVersion, setSelectedVersion] =
    useState<SliceMachineVersion | null>(
      updateVersion.availableVersions[0] || null
    );

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
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

interface VersionBadgeProps {
  isSelected: boolean;
  onClick: () => void;
  versionNumber: string;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  isSelected,
  onClick,
  versionNumber,
}) => {
  return (
    <Flex
      sx={{
        p: 1,
        borderRadius: "4px",
        cursor: "pointer",
        transition: "200ms all",
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
    </Flex>
  );
};
