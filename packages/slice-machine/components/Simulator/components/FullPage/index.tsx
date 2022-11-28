import { Flex } from "theme-ui";

const FullPage: React.FC = ({ children }) => (
  <Flex
    sx={{
      bg: "grey01",
      top: "128px",
      position: "absolute",
      height: "calc(100vh - 128px)",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: "1",
    }}
  >
    {children}
  </Flex>
);

export default FullPage;
