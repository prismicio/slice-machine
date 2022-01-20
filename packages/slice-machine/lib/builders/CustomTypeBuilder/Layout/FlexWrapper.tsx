import { Flex } from "theme-ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
const FlexWrapper = ({ children, sx }: { children: any; sx: any }) => (
  <Flex
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    sx={{
      display: "flex",
      flexWrap: "wrap",
      margin: "0 auto",
      maxWidth: 1224,
      mx: "auto",
      px: 4,
      ...sx,
    }}
  >
    {children}
  </Flex>
);

export default FlexWrapper;
