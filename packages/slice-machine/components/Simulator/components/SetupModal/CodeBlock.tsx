import React, { useState } from "react";
import { Button, useThemeUI, Box } from "theme-ui";

import { MdCheck, MdContentCopy } from "react-icons/md";

import CodeBlock from "../../../CodeBlock";

const CodeBlockWithCopy: React.FC<{ children: string }> = ({ children }) => {
  const { theme } = useThemeUI();
  const [isCopied, setIsCopied] = useState(false);

  const copy = (): void => {
    children &&
      navigator.clipboard.writeText(children).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1200);
      });
  };

  return (
    <Box sx={{ position: "relative" }}>
      <CodeBlock codeStyle={{ padding: "16px", width: "100%" }}>
        {children}
      </CodeBlock>
      <Button
        onClick={copy}
        sx={{
          position: "absolute",
          top: "4px",
          right: "4px",
          width: 24,
          height: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 0,
        }}
      >
        {isCopied ? (
          <MdCheck
            size={16}
            color={theme?.colors?.success as string | undefined}
          />
        ) : (
          <MdContentCopy size={14} />
        )}
      </Button>
    </Box>
  );
};

export default CodeBlockWithCopy;
