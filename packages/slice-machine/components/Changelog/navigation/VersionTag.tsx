import { Text } from "theme-ui";
import { VersionTags } from ".";

interface VersionTagProps {
  type: VersionTags;
  hasUpToDateVersions: boolean;
}

export const VersionTag: React.FC<VersionTagProps> = ({
  type,
  hasUpToDateVersions,
}) => (
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
      ...(type === VersionTags.Current &&
        hasUpToDateVersions && {
          bg: "lightGreen",
          color: "code.green",
        }),
      ...(type === VersionTags.Current &&
        !hasUpToDateVersions && {
          bg: "lightOrange",
          color: "code.orange",
        }),
    }}
  >
    {type}
  </Text>
);
