import { Text } from "@prismicio/editor-ui";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import type { CodeProps } from "react-markdown/lib/ast-to-react";
import remarkGfm from "remark-gfm";

import { telemetry } from "@/apiClient";
import { CodeBlock } from "@/components/CodeBlock";
import { useAdapterName } from "@/hooks/useAdapterName";

import styles from "./MarkdownRenderer.module.css";

type MarkdownRenderer = FC<{
  markdown: string;
}>;

const MarkdownCodeBlock = (props: CodeProps) => {
  const adapter = useAdapterName();
  if (props.inline === true) {
    return <code {...props} className={styles.inlineCode} />;
  }
  const maybeFileInfo = (() => {
    if (props.node?.data?.meta !== undefined) {
      const meta = props.node?.data?.meta as string;
      const fileName = meta.substring(1, meta.length - 1);
      return {
        fileName,
        language: props.className?.split("-")[1],
      };
    }
    return null;
  })();

  const onCopy = () => {
    void telemetry.track({
      event: "page-type:copy-snippet",
      framework: adapter,
    });
  };

  return (
    <CodeBlock
      copy
      {...props}
      onCopy={onCopy}
      code={props.children}
      {...(maybeFileInfo !== null ? { fileInfo: maybeFileInfo } : {})}
    />
  );
};

export const MarkdownRenderer: MarkdownRenderer = ({ markdown }) => {
  return (
    <ReactMarkdown
      children={markdown}
      linkTarget="_blank"
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
