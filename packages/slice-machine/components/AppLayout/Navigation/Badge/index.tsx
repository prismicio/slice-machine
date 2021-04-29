import Link from "next/link";
import { Box } from "theme-ui";

interface BadgeProps {
  version: string;
  label?: string;
}

const VersionBadge = ({ version, label = "V" }: BadgeProps) => {
  return (
    <Link href="/changelog" passHref>
      <Box
        as="span"
        sx={{
          cursor: "pointer",
          color: "textClear",
          opacity: "0.8",
          fontSize: "12px",
        }}
      >
        {label} : {version}
      </Box>
    </Link>
  );
};

export default VersionBadge;
