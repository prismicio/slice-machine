import React from "react";
import { IoCloudOfflineOutline } from "react-icons/io5";
import { Flex, Text } from "theme-ui";

export const OfflinePage = () => {
  return (
    <Flex sx={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Flex
        sx={{
          flexDirection: "column",
          alignItems: "center",
          transform: "translateY(-50%)",
        }}
      >
        <IoCloudOfflineOutline size={48} />
        <Text
          sx={{
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "32px",
            mb: "8px",
            mt: "2px",
            textAlign: "center",
          }}
        >
          No internet connection
        </Text>
        <Text
          sx={{ fontSize: "13px", lineHeight: "24px", textAlign: "center" }}
        >
          Connect to the internet to sync your changes.
        </Text>
      </Flex>
    </Flex>
  );
};
