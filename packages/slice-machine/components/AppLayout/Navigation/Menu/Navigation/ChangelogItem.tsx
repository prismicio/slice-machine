import React from "react";
import { Flex, Text, Link as ThemeLink } from "theme-ui";
import { MdInfo, MdBolt } from "react-icons/md";
import Link from "next/link";

const ChangelogItem: React.FunctionComponent<{ currentVersion: string }> = ({
  currentVersion,
}) => (
  <Link href={"/changelog"} passHref>
    <ThemeLink
      variant="links.sidebar"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        mt: 3,
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <MdInfo
          style={{
            width: "24px",
            height: "24px",
          }}
        />
        <Text
          sx={{
            ml: 2,
          }}
        >
          Changelog
        </Text>
      </Flex>
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <MdBolt />
        <Text
          sx={{
            ml: 1,
          }}
        >
          v{currentVersion}
        </Text>
      </Flex>
    </ThemeLink>
  </Link>
);

export default ChangelogItem;
