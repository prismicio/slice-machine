import React from "react";
import { Flex, Text } from "theme-ui";

interface ChangesSectionHeaderProps {
  text: string;
  amount: number;
}

export const ChangesSectionHeader: React.FC<ChangesSectionHeaderProps> = ({
  text,
  amount,
}) => {
  return (
    <Flex
      sx={{
        alignItems: "center",
        mt: "37px",
        backgroundColor: "#EEEEEE",
        borderRadius: 4,
        padding: "12px 16px",
        mb: "16px",
      }}
    >
      <Text sx={{ fontWeight: "heading" }}>{text}</Text>
      <Text sx={{ ml: "8px", color: "#4E4E55" }}>{amount}</Text>
    </Flex>
  );
};
