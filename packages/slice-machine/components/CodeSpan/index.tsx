import { Box } from "theme-ui";

type CodeSpanProps = {
  // TODO: Can `string` be removed?
  children?: React.ReactElement | string;
};

export const CodeSpan = ({ children }: CodeSpanProps) => {
  return (
    <Box
      as="code"
      sx={{
        bg: "rgba(0, 0, 0, 0.05)",
        borderRadius: 3,
        padding: "2px 4px",
      }}
    >
      {children}
    </Box>
  );
};

export default CodeSpan;
