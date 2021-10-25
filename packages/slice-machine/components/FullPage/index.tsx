import { FlexProps, Flex } from "theme-ui";

const FullPage: React.FunctionComponent<FlexProps> = ({ children }) => (
  <Flex
    sx={{
      height: "calc(100vh - 57px)",
      width: "100vw",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </Flex>
);

export default FullPage;
