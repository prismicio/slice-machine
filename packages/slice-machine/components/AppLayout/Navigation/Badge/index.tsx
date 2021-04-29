import Link from "next/link";
import { Box } from "theme-ui";

interface BadgeProps {
  version: string;
  label?: string;
}

const VersionBadge = ({ version, label = "Version" }: BadgeProps) => {
  return (
    <div>
      <Link href="/changelog" passHref>
        <Box
          as="span"
          sx={{
            cursor: "pointer",
            color: "textClear",
            opacity: "0.8",
            fontSize: "12px",
            position: "absolute",
            bottom: 3,
          }}
        >
          {label} - {version}
        </Box>
      </Link>
    </div>
  );
};

export default VersionBadge;
