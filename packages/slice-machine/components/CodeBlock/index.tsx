import React from "react";
import { Flex } from "theme-ui";
import hljs from "highlight.js";

export type Language = "javascript" | "bash" | "xml" | "html" | "json";

const DEFAULT_LANGUAGES: Array<Language> = [
  "javascript",
  "bash",
  "xml",
  "html",
  "json",
];

const CodeBlock: React.FC<{
  children: string;
  lang?: Language;
  style?: React.CSSProperties;
  codeStyle?: React.CSSProperties;
}> = ({ children, lang, style, codeStyle }) => {
  const text = lang
    ? hljs.highlight(children, { language: lang }).value
    : hljs.highlightAuto(children, DEFAULT_LANGUAGES).value;

  return (
    <Flex as="pre" style={style}>
      <code
        className="hljs"
        style={{
          overflowX: "auto",
          padding: "3px 5px",
          borderRadius: "6px",
          border: "1px solid",
          borderColor: "#4E4E55",
          ...codeStyle,
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </Flex>
  );
};

export default CodeBlock;
