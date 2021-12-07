import React from "react";
import { Flex } from "theme-ui";
import hljs from "highlight.js";

const CodeBlock: React.FC<{ children: string }> = ({ children }) => {
  const text = hljs.highlightAuto(children, [
    "javascript",
    "bash",
    "xml",
    "html",
    "json",
  ]).value;
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
