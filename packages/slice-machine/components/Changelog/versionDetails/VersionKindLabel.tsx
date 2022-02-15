import React from "react";
import { Text } from "theme-ui";
import { transparentize } from "@theme-ui/color";
import { VersionKind } from "@models/common/versions";
import { ThemeUIStyleObject } from "@theme-ui/css";

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
    ...(versionKind === VersionKind.MAJOR
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
