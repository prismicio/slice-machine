import Link from "next/link";
import { Badge } from "theme-ui";

export const VersionBadge = ({ version }) => {
  return (
    <div>
      <Link href="/changelog" passHref>
        <Badge sx={{ cursor: "pointer" }}>{version}</Badge>
      </Link>
    </div>
  );
};
