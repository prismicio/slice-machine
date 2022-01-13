import React from "react";
import { Flex } from "theme-ui";

interface FlexCardProps {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export const FlexCard: React.FC<FlexCardProps> = ({ selected, ...rest }) => (
  <Flex
    sx={{
      p: "24px",
      mb: 3,
      alignItems: "top",
      cursor: "pointer",
      borderRadius: "6px",
      backgroundColor: "grayLight",
      boxShadow: selected
        ? (t) => `0 0 0 2px ${String(t.colors?.primary)}`
        : "none",
      "&:hover": {
        boxShadow: (t) => `0 0 0 2px ${String(t.colors?.primary)}`,
      },
    }}
    {...rest}
  />
);
