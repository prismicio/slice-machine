import type { FC, ReactNode } from "react";
import { Box, ThemeUIStyleObject } from "theme-ui";

export interface CardBoxProps {
  children?: ReactNode;
  sx?: ThemeUIStyleObject;
  withRadius: boolean;
  radius?: string;
  bg?: string;
  background?: string;
}

export const CardBox: FC<CardBoxProps> = ({
  bg,
  background,
  sx,
  withRadius,
  radius,
  children,
}) => (
  <Box
    sx={{
      p: 4,
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
      bg: bg || background,
      ...(withRadius
        ? {
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
          }
        : null),
      ...sx,
    }}
  >
    {children}
  </Box>
);
