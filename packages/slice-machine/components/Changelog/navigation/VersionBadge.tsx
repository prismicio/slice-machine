import { Flex, Text } from "theme-ui";
import { transparentize } from "@theme-ui/color";
import { VersionTags } from ".";
import { VersionTag } from "./VersionTag";

interface VersionBadgeProps {
  isSelected: boolean;
  onClick: () => void;
  versionNumber: string;
  tags: VersionTags[];
  hasUpToDateVersions: boolean;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  isSelected,
  onClick,
  versionNumber,
  tags,
  hasUpToDateVersions,
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
      <Flex
        sx={{
          gap: "8px",
        }}
      >
        {tags.map((tag) => (
          <VersionTag
            key={tag}
            type={tag}
            hasUpToDateVersions={hasUpToDateVersions}
          />
        ))}
      </Flex>
    </Flex>
  );
};
