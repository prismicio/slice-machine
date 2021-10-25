import { Box, BoxProps } from "theme-ui";

const Container: React.FunctionComponent<BoxProps> = ({
  children,
  sx = {},
  ...rest
}) => {
  return (
    <Box
      sx={{
        maxWidth: 1224,
        mx: "auto",
        px: 3,
        py: 4,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Container;
