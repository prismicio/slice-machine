import React, { useState } from "react";
import { Button, useThemeUI, Box, Flex } from "theme-ui";

import { MdCheck, MdContentCopy } from "react-icons/md";

import CodeBlock, { Language } from "../../../CodeBlock";
import { IconType } from "react-icons";

const CodeBlockWithCopy: React.FC<{
  children: string;
  customCopyText?: string;
  fileName: string;
  FileIcon: IconType;
  lang?: Language;
}> = ({ children, customCopyText, fileName, FileIcon, lang }) => {
  const { theme } = useThemeUI();
  const [isCopied, setIsCopied] = useState(false);

  const copy = (): void => {
    children &&
      navigator.clipboard.writeText(customCopyText || children).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1200);
      });
  };

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <CodeBlock
        {...(lang ? { lang, codeClass: "is-json" } : {})}
        sx={{
          width: "100%",
          height: "100%",
          bg: "codeBlockBackground",
          borderRadius: "6px",
          flexDirection: "column",
          boxShadow:
            "0px 12.5216px 10.0172px rgba(0, 0, 0, 0.035), 0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0282725), 0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0196802)",
        }}
        codeStyle={{
          padding: "16px",
          color: "#FFF",
          border: "none",
          whiteSpace: "break-spaces",
          backgroundColor: String(theme.colors?.codeBlockBackground),
          height: "100%",
          fontSize: "12px",
        }}
        Header={() => (
          <Flex
            sx={{
              px: "26px",
              py: "22px",
              color: "#FFF",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(111, 110, 119, 0.2)",
            }}
          >
            <Flex sx={{ alignItems: "center" }}>
              {FileIcon ? (
                <FileIcon size={14} style={{ marginRight: "12px" }} />
              ) : null}{" "}
              {fileName}
            </Flex>
            <Button
              onClick={copy}
              variant="transparent"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 0,
                fontSize: "12px",
                color: "#FFF",
              }}
            >
              Copy&nbsp;
              {isCopied ? (
                <MdCheck size={16} color={String(theme?.colors?.success)} />
              ) : (
                <MdContentCopy size={16} style={{ marginLeft: "8px" }} />
              )}
            </Button>
          </Flex>
        )}
      >
        {children}
      </CodeBlock>
    </Box>
  );
};

export default CodeBlockWithCopy;
