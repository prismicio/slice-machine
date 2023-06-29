import { FC } from "react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

import { CodeBlock } from "@src/components/CodeBlock";
import type { CodeProps } from "react-markdown/lib/ast-to-react";

import { Text } from "@prismicio/editor-ui";

import * as styles from "./MarkdownRenderer.css";

type MarkdownRenderer = FC<{
  markdown: string;
}>;

const MarkdownCodeBlock = (props: CodeProps) => {
  const maybeFileInfo = (() => {
    if (props.node?.data?.meta !== undefined) {
      const fileName = (props.node?.data?.meta as string).replace(/\[|\]/g, "");
      return {
        fileName,
        language: props.className?.split("-")[1],
      };
    }
    return null;
  })();

  return (
    <CodeBlock
      copy
      {...props}
      code={props.children}
      {...(maybeFileInfo !== null ? { fileInfo: maybeFileInfo } : {})}
    />
  );
};

export const MarkdownRenderer: MarkdownRenderer = ({ markdown }) => {
  return (
    <ReactMarkdown
      children={markdown}
      remarkPlugins={[remarkGfm]}
      components={{
        code: (props) => <MarkdownCodeBlock {...props} />,
        h1: (props) => (
          <Text children={props.children} component="h1" variant="h1" />
        ),
        h2: (props) => (
          <Text children={props.children} component="h2" variant="h2" />
        ),
        h3: (props) => (
          <Text children={props.children} component="h3" variant="h3" />
        ),
        h4: (props) => (
          <Text children={props.children} component="h4" variant="h4" />
        ),
        h5: (props) => (
          <Text children={props.children} component="h4" variant="h4" />
        ),
        p: (props) => (
          <Text
            className={styles.section}
            children={props.children}
            component="p"
            variant="normal"
          />
        ),
        pre: (props) => (
          <Text
            className={styles.section}
            children={props.children}
            component="pre"
            variant="normal"
          />
        ),
      }}
    />
  );
};
