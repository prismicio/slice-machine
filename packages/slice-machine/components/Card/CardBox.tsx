import { Box, ThemeUIStyleObject } from "theme-ui";

export interface CardBoxProps {
  sx?: ThemeUIStyleObject;
  withRadius: boolean;
  radius?: string;
  bg?: string;
  background?: string;
}

export const CardBox: React.FC<CardBoxProps> = ({
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
