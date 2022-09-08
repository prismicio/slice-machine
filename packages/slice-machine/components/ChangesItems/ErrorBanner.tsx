import React from "react";
import { Flex, Text, ThemeUIStyleObject } from "theme-ui";
import { alpha } from "@theme-ui/color";

interface ErrorBannerProps {
  message: string;
  sx?: ThemeUIStyleObject;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, sx }) => (
  <Flex
    sx={{
      alignItems: "center",
      bg: alpha("error", 0.2),
      color: "error",
      borderRadius: 4,
      padding: "16px",
      ...sx,
    }}
  >
    <Text sx={{ fontWeight: "heading" }}>{message}</Text>
  </Flex>
);
