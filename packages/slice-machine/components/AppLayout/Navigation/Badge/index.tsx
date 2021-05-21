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
