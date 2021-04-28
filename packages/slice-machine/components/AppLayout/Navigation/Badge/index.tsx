import Link from "next/link";
import { Box } from "theme-ui";

const VersionBadge = ({ version }: { version: string }) => {
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
          Prismic Studio - version {version}
        </Box>
      </Link>
    </div>
  );
};

export default VersionBadge;
