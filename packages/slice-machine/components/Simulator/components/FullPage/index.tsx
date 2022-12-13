import { ReactNode } from "react";
import { Flex, ThemeUICSSObject } from "theme-ui";

const FullPage: React.FC<{ children: ReactNode; sx?: ThemeUICSSObject }> = ({
  children,
  sx,
}) => (
  <Flex
    sx={{
      bg: "grey07",
      height: "90%",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1",
      ...sx,
    }}
  >
    <Flex
      sx={{
        marginTop: "-128px",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {children}
    </Flex>
  </Flex>
);

export default FullPage;
