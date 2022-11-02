import React from "react";
import { Flex } from "theme-ui";

export const ChangesSectionHeader: React.FC = ({ children }) => {
  return (
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        mt: "40px",
        bg: "grey02",
        borderRadius: 4,
        padding: "12px 16px",
      }}
    >
      {children}
    </Flex>
  );
};
