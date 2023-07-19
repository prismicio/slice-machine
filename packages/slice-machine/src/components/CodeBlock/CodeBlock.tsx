import { IconButton, Text } from "@prismicio/editor-ui";
import { type ReactNode, useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import markup from "react-syntax-highlighter/dist/cjs/languages/prism/markup";
import { prism } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { CodeIcon } from "@src/icons/CodeIcon";
import { JavaScript } from "@src/icons/JavaScript";
import { TypeScript } from "@src/icons/TypeScript";
import { Vue } from "@src/icons/Vue";

import * as styles from "./CodeBlock.css";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("markup", markup);
// @ts-expect-error - `react-syntax-highlighter` has wrong 3rd party types
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
SyntaxHighlighter.alias("markup", "vue");

type CodeBlockProps = {
  className?: string;
  copy?: boolean;
  code: ReactNode & ReactNode[];
  fileInfo?: {
    fileName: string;
  };
  onCopy?: () => void;
};

const FileIcon = ({ fileName }: { fileName: string }) => {
  const extension = fileName.split(".")?.[1];

  const Extension = (() => {
    switch (extension) {
      case "ts":
      case "tsx":
        return <TypeScript />;
      case "js":
      case "jsx":
        return <JavaScript />;
      case "vue":
        return <Vue />;
      default:
        return <CodeIcon />;
    }
  })();

  return Extension;
};

const Copy = ({ code, onCopy }: { code: string; onCopy?: () => void }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 1200);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isCopied]);

  const copy = (): void => {
    void navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      if (onCopy !== undefined) {
        onCopy();
      }
    });
  };
  return (
    <IconButton
      size="small"
      onClick={copy}
      icon={isCopied ? "check" : "contentCopy"}
    />
  );
};

export const CodeBlock = ({
  fileInfo,
  className,
  copy,
  code,
  onCopy,
}: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className ?? "");

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {fileInfo !== undefined ? (
          <div className={styles.fileInfo}>
            <FileIcon fileName={fileInfo.fileName} />
            <Text className={styles.fileName} color="grey11">
              {fileInfo.fileName}
            </Text>
          </div>
        ) : (
          <span />
        )}
        {copy === true ? <Copy onCopy={onCopy} code={String(code)} /> : null}
      </div>
      {match !== null && match[1] ? (
        <SyntaxHighlighter
          showLineNumbers
          customStyle={{
            margin: 0,
            border: "none",
            fontSize: "12px",
            lineHeight: "18px",
            borderRadius: "none",
            backgroundColor: "#FFF",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
          children={String(code).replace(/\n$/, "")}
          style={prism}
          language={match[1]}
          PreTag="div"
        />
      ) : (
        code
      )}
    </div>
  );
};
