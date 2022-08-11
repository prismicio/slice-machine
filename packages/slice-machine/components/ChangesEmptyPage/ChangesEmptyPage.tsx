import React from "react";
import { MdDone } from "react-icons/md";
import { Flex, Text } from "theme-ui";

export const ChangesEmptyPage = () => {
  return (
    <Flex sx={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Flex
        sx={{
          flexDirection: "column",
          alignItems: "center",
          transform: "translateY(-50%)",
        }}
      >
        <MdDone size={48} />
        <Text
          sx={{
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "32px",
            mb: "8px",
            mt: "2px",
          }}
        >
          Up to date
        </Text>
        <Text sx={{ fontSize: "13px", lineHeight: "24px" }}>
          Your local project is in sync with your remote Prismic repository.
        </Text>
      </Flex>
    </Flex>
  );
};
