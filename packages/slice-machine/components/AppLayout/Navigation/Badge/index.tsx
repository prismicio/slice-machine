import Link from "next/link";
import { Box, Link as ThemeLink } from "theme-ui";

interface BadgeProps {
  version: string;
  label?: string;
}

const VersionBadge = ({ version, label = "V" }: BadgeProps) => {
  return (
    <Box
      as="span"
      sx={{
        cursor: "pointer",
        color: "textClear",
        opacity: "0.8",
        fontSize: "12px",
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
