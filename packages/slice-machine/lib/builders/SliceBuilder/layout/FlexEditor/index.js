import { Flex, Box } from "theme-ui";

const FlexEditor = ({ children, SideBar, sx, ...rest }) => (
  <Flex
    sx={{
      display: "flex",
      flexWrap: "wrap",
      maxWidth: 1224,
      mx: "auto",
      px: 3,
      py: 4,
      ...sx,
    }}
    {...rest}
  >
    <Box
      as="main"
      sx={{
        flexGrow: 99999,
        flexBasis: 0,
        minWidth: 320,
      }}
    >
      {children}
    </Box>
    {SideBar}
  </Flex>
);

export default FlexEditor;
