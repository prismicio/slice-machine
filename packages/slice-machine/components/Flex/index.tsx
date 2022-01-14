import React from "react";
import { Box, ThemeUIStyleObject } from "theme-ui";

interface FlexProps {
  children: React.ReactNode;
  sx?: ThemeUIStyleObject;
}

export const Flex: React.FC<FlexProps> = ({ children, sx, ...rest }) => (
  <Box
    sx={{
      display: ["block", "block", "flex"],
      flexWrap: "wrap",
      justifyContent: "space-between",
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

interface ColProps {
  children: React.ReactNode;
  cols?: number;
}

export const Col: React.FC<ColProps> = ({ children, cols = 2 }) => (
  <Box sx={{ flex: `0 ${100 / cols - 1}%`, mb: 1 }}>{children}</Box>
);
