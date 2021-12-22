import React, { useState } from "react";
import { Button, useThemeUI, Box } from "theme-ui";

import { BiCopy } from "react-icons/bi";
import { MdCheck } from "react-icons/md";

import CodeBlock from "@components/CodeBlock";

const buttonIconStyle: React.CSSProperties = {
  position: "relative",
  top: "3px",
};

export default function CodeBlockWithCopy({
  children,
}: {
  children: string;
}): React.ReactNode {
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
          p: 2,
        }}
      >
        {isCopied ? (
          <MdCheck
            size={16}
            color={theme?.colors?.success as string | undefined}
            style={buttonIconStyle}
          />
        ) : (
          <BiCopy size={16} style={buttonIconStyle} />
        )}
      </Button>
    </Box>
  );
}
