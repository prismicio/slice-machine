import React from "react";
import { Flex } from "theme-ui";
import hljs from "highlight.js";

type language = "javascript" | "bash" | "xml" | "html" | "json";

const DEFAULT_LANGUAGES: Array<language> = [
  "javascript",
  "bash",
  "xml",
  "html",
  "json",
];

const CodeBlock: React.FC<{ children: string; lang?: language }> = ({
  children,
  lang,
}) => {
  const text = lang
    ? hljs.highlight(children, { language: lang }).value
    : hljs.highlightAuto(children, DEFAULT_LANGUAGES).value;

  return (
    <Flex as="pre">
      <code
        className="hljs"
        style={{ overflowX: "auto", padding: "3px 5px" }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </Flex>
  );
};

export default CodeBlock;
