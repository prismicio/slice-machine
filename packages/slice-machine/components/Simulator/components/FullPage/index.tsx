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
      zIndex: "1",
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
