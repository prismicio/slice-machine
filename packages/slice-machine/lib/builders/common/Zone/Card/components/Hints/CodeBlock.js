import React, { useRef, useState } from "react";
import { useThemeUI, Text, Button, Flex, Box } from "theme-ui";
// import Prism from "@theme-ui/prism";

import { BsCode } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { MdCheck } from "react-icons/md";
import Code from "../../../../../../../components/CodeBlock";

const buttonIconStyle = {
  position: "relative",
  top: "3px",
};

const CodeBlock = ({ docs, ...props }) => {
  const ref = useRef(null);
  const { theme } = useThemeUI();

  const [isCopied, setIsCopied] = useState(false);

  const copy = () => {
    const text = ref.current.textContent;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1200);
    });
  };

  return props.children ? (
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
          color={theme.colors.icons}
          mr={2}
          style={{
            border: "1px solid",
            borderColor: theme.colors.borders,
            borderRadius: "3px",
            padding: "4px",
          }}
        />
        <Code {...props} />
      </Flex>
      <Box>
        <Button onClick={copy} variant="textButton">
          {isCopied ? (
            <MdCheck
              size={16}
              color={theme.colors.success}
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
