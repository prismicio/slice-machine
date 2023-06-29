import { CSSProperties, ReactNode, useState } from "react";

import * as styles from "./CodeBlock.css";
import { Text, IconButton } from "@prismicio/editor-ui";

import theme from "./theme";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import * as FileIcons from "@src/icons/FileIcons";
import { CodeIcon } from "@src/icons/CodeIcon";

type CodeBlockProps = {
  className?: string;
  copy?: boolean;
  code: ReactNode & ReactNode[];
  fileInfo?: {
    fileName: string;
  };
};

const FileIcon = ({ fileName }: { fileName: string }) => {
  const extension = fileName.split(".")?.[1];

  const Extension = (() => {
    switch (extension) {
      case "ts":
      case "tsx":
        return <FileIcons.Typescript />;
      case "js":
      case "jsx":
        return <FileIcons.Javascript />;
      case "vue":
        return <FileIcons.Vue />;
      default:
        return <CodeIcon />;
    }
  })();

  return Extension;
};

const Copy = ({ code }: { code: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = (): void => {
    void navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1200);
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
}: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className ?? "");

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {fileInfo !== undefined ? (
          <div className={styles.fileInfo}>
            <FileIcon fileName={fileInfo.fileName} />
            <Text color="grey11">{fileInfo.fileName}</Text>
          </div>
        ) : (
          <span />
        )}
        {copy === true ? <Copy code={String(code)} /> : null}
      </div>
      {match !== null && match[1] ? (
        <SyntaxHighlighter
          showLineNumbers
          customStyle={{
            margin: 0,
            border: "none",
            borderRadius: "none",
            backgroundColor: "#FFF",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
          children={String(code).replace(/\n$/, "")}
          style={theme as { [key: string]: CSSProperties }}
          language={match[1]}
          PreTag="div"
        />
      ) : (
        code
      )}
    </div>
  );
};
