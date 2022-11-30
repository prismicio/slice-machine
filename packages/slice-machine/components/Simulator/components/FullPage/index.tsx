import { Flex, ThemeUICSSObject } from "theme-ui";

const FullPage: React.FC<{ sx?: ThemeUICSSObject }> = ({ children, sx }) => (
  <Flex
    sx={{
      bg: "grey01",
      height: "90%",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: "1",
      ...sx,
    }}
  >
    {children}
  </Flex>
);

export default FullPage;
