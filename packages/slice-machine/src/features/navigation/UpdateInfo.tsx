import {
  Button,
  Card,
  CardContent,
  Text,
  useMediaQuery,
} from "@prismicio/editor-ui";
import Link from "next/link";

import { useUpdateAvailable } from "@/hooks/useUpdateAvailable";

export function UpdateInfo() {
  const isCollapsed = useMediaQuery({ max: "medium" });

  const { sliceMachineUpdateAvailable, adapterUpdateAvailable } =
    useUpdateAvailable();

  if (
    (!sliceMachineUpdateAvailable && !adapterUpdateAvailable) ||
    isCollapsed
  ) {
    return null;
  }

  return (
    <Card color="grey3" padding={16}>
      <CardContent>
        <Text variant="smallBold" color="grey12">
          Updates Available
        </Text>
        <Text color="grey11" variant="small">
          Some updates of Slice Machine are available.
        </Text>
        <Button
          size="large"
          color="grey"
          sx={{ width: "100%", marginTop: 16 }}
          asChild
        >
          <Link href="/changelog">Learn more</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
