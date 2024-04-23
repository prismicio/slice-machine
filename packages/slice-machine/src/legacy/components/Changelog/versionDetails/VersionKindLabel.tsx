import { VersionKind } from "@slicemachine/manager";
import { transparentize } from "@theme-ui/color";
import React from "react";
import { Text, type ThemeUIStyleObject } from "theme-ui";

interface VersionKindLabelProps {
  versionKind: VersionKind;
}

export const VersionKindLabel: React.FC<VersionKindLabelProps> = ({
  versionKind,
}) => {
  const versionLabelStyle: ThemeUIStyleObject = {
    fontSize: "14px",
    padding: "2px 4px",
    borderRadius: "4px",
    textTransform: "uppercase",
    ...(versionKind === "MAJOR"
      ? {
          color: "purple",
          bg: transparentize("purple", 0.85),
        }
      : {
          color: "grey05",
          bg: "grey02",
        }),
  };

  return <Text sx={versionLabelStyle}>{versionKind}</Text>;
};
