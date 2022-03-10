import { Flex, Text, Button } from "theme-ui";
import Link from "next/link";

import { MdHorizontalSplit } from "react-icons/md";

const UpdateSliceZoneModalEmptyState = () => (
  <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
    <MdHorizontalSplit size={40} />
    <Text variant={"small"} sx={{ mt: 2 }}>
      No Slices in your project
    </Text>
    <Text variant={"xs"} sx={{ maxWidth: "412px", textAlign: "center", mt: 3 }}>
      Slices are sections of your website. Prismic documents contain a dynamic
      "Slice Zone" that allows content creators to add, edit, and rearrange
      Slices to compose dynamic layouts for any page design.
    </Text>
    <Link passHref href={`/slices`}>
      <Button sx={{ mt: "24px" }}>Create new Slice</Button>
    </Link>
  </Flex>
);

export default UpdateSliceZoneModalEmptyState;
