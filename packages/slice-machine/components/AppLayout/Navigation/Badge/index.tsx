import Link from "next/link";
import { Box, Link as ThemeLink } from "theme-ui";
import React from "react";

interface BadgeProps {
  version: string;
  label?: string;
}

const VersionBadge: React.FunctionComponent<BadgeProps> = ({
  version,
  label = "V",
}) => {
  return (
    <Box
      as="span"
      sx={{
        color: "textClear",
        opacity: "0.8",
        fontSize: "12px",
        ml: 1,
      }}
    >
      {label} : {version}{" "}
      <Link passHref href="/changelog">
        <ThemeLink sx={{ color: "textClear" }}>(Changelog)</ThemeLink>
      </Link>
    </Box>
  );
};

export default VersionBadge;
