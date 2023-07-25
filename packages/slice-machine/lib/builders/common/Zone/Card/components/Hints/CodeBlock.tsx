import React, { useState } from "react";
import { useThemeUI, Text, Button, Flex, Box } from "theme-ui";

import { BsCode } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { MdCheck } from "react-icons/md";
import Code from "@components/CodeBlock";

import { NestableWidget, UID } from "@prismicio/types-internal/lib/customtypes";

const buttonIconStyle: React.CSSProperties = {
  position: "relative",
  top: "3px",
};

export interface Item {
  key: string;
  value: NestableWidget | UID;
}

export type RenderHintBaseFN = (args: { item: Item }) => string;

type CodeBlockProps = {
  code: string | null | undefined;
  lang?: string;
};
const CodeBlock: React.FC<CodeBlockProps> = ({ code, lang }) => {
  const { theme } = useThemeUI();

  const [isCopied, setIsCopied] = useState(false);

  const copy = (): void => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    code &&
      void navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1200);
      });
  };

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return code ? (
    <Flex
      sx={{
        p: 2,
        px: 3,
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: "borders",
        justifyContent: "space-between",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
          display: ["none", "none", "flex"],
          maxWidth: "80%",
        }}
      >
        <BsCode
          size={26}
          color={theme?.colors?.icons as string | undefined}
          style={{
            border: "1px solid",
            borderColor: theme?.colors?.borders as string | undefined,
            borderRadius: "3px",
            padding: "4px",
            marginRight: "2px",
          }}
        />
        <Code
          sx={{
            margin: "0px 8px",
            border: "none",
            borderRadius: "3px",
            fontSize: "13px",
          }}
          lang={lang}
        >
          {code}
        </Code>
      </Flex>
      <Box>
        <Button onClick={copy} variant="textButton">
          {isCopied ? (
            <MdCheck
              size={16}
              color={theme?.colors?.success as string | undefined}
              style={buttonIconStyle}
            />
          ) : (
            <BiCopy size={16} style={buttonIconStyle} />
          )}
          <Text
            as="span"
            sx={{ display: ["none", "inline", "none", "inline"] }}
          >
            &nbsp;Copy
          </Text>
        </Button>
      </Box>
    </Flex>
  ) : null;
};

export default CodeBlock;
