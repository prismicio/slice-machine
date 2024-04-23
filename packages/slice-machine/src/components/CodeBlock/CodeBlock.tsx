import { IconButton, Text } from "@prismicio/editor-ui";
import { type ReactNode, useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import markup from "react-syntax-highlighter/dist/cjs/languages/prism/markup";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import { prism } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { CodeIcon } from "@/icons/CodeIcon";
import { JavaScript } from "@/icons/JavaScript";
import { Svelte } from "@/icons/Svelte";
import { TypeScript } from "@/icons/TypeScript";
import { Vue } from "@/icons/Vue";

import styles from "./CodeBlock.module.css";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("markup", markup);
// @ts-expect-error - `react-syntax-highlighter` has wrong 3rd party types
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
SyntaxHighlighter.alias("markup", "vue");
// @ts-expect-error - `react-syntax-highlighter` has wrong 3rd party types
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
SyntaxHighlighter.alias("markup", "svelte");

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
  const extension = (fileName.match(/\.([^\.]*)$/) ?? [])[1];

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
      case "svelte":
        return <Svelte />;
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
      hiddenLabel={isCopied ? "Code successfully copied" : "Copy code"}
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
