import { useState, useRef } from "react";
import { Box, Flex, Button, useThemeUI } from "theme-ui";
import parse, {
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import { MdCheck, MdContentCopy } from "react-icons/md";

import CodeSpan from "@components/CodeSpan";

const Pre = ({ children, ...props }: { children?: React.ReactNode }) => {
  const { theme } = useThemeUI();

  const [isCopied, setIsCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const copy = (): void => {
    if (preRef.current) {
      navigator.clipboard
        .writeText(preRef.current.innerText)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1200);
        })
        .catch(() => {
          // ignored
        });
    }
  };

  return (
    <Box
      {...props}
      sx={{
        backgroundColor: "codeBlockBackground",
        borderRadius: 8,
      }}
    >
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
          {/*
                <FileIcon size={14} style={{ marginRight: "12px" }} />
                  {fileName}
         */}
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
      <Box
        ref={preRef}
        as="pre"
        sx={{
          color: "#c9d1d9",
          padding: "16px 20px",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const defaultComponents: NonNullable<HTMLRendererProps["components"]> = {
  code: ({ children }) => {
    return <CodeSpan>{children}</CodeSpan>;
  },
  pre: ({ children, ...props }) => {
    return <Pre {...props}>{children}</Pre>;
  },
};

type HTMLRendererProps = {
  html: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
};

const HTMLRenderer = ({
  html,
  components = {},
}: HTMLRendererProps): JSX.Element => {
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (domNode instanceof Element && domNode.attribs) {
        const children = domToReact(domNode.children, parserOptions);

        const resolvedComponents = { ...components, ...defaultComponents };
        const Comp = resolvedComponents[domNode.name];

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (Comp) {
          return (
            <Comp name={domNode.name} {...domNode.attribs}>
              {children}
            </Comp>
          );
        }
      }
    },
  };

  return <>{parse(html, parserOptions)}</>;
};

export default HTMLRenderer;
