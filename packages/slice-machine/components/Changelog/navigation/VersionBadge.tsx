import { Flex, Text } from "theme-ui";
import { transparentize } from "@theme-ui/color";
import { VersionTags } from ".";
import { VersionTag } from "./VersionTag";

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
