import { Box } from "@prismicio/editor-ui";
import { ReactNode } from "react";

interface DialogContentProps {
  children: ReactNode;
  selected: boolean;
}

export function DialogContent(args: DialogContentProps) {
  const { children, selected } = args;

  if (!selected) {
    return (
      <Box display="none" minHeight={0}>
        {children}
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
      {children}
    </Box>
  );
}
