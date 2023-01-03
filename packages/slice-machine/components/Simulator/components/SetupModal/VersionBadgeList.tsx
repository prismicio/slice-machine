import { Flex } from "@components/Flex";
import { FC, ReactNode } from "react";
import { Button, ThemeUIStyleObject } from "theme-ui";

export const VersionBadge: FC<{
  children: ReactNode;
  isSelected: boolean;
  sx?: ThemeUIStyleObject;
  onClick: () => void;
}> = ({ children, isSelected, sx, onClick }) => (
  <Button
    onClick={onClick}
    sx={{
      borderRadius: "60px",
      p: "2px 12px",
      color: "#F1EEFE",
      fontSize: "11px",
      lineHeight: "16px",
      width: "fit-content",
      border: "none",
      ...(isSelected
        ? {
            background: "#443592",
          }
        : {
            background: "transparent",
          }),
      ...sx,
    }}
  >
    {children}
  </Button>
);

const VersionBadgeList: FC<{
  versions: string[];
  selectedVersion: string;
  setSelectedVersion: (s: string) => void;
}> = ({ versions, selectedVersion, setSelectedVersion }) => (
  <Flex sx={{ maxWidth: "fit-content", p: "16px 16px 0 16px" }}>
    {versions.map((version, i) => (
      <VersionBadge
        key={version}
        sx={versions[i + 1] ? { mr: "12px" } : undefined}
        isSelected={version === selectedVersion}
        onClick={() => setSelectedVersion(version)}
      >
        {version}
      </VersionBadge>
    ))}
  </Flex>
);

export default VersionBadgeList;
