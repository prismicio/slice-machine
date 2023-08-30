import React from "react";
import { type ThemeUIStyleObject, Flex, useThemeUI } from "theme-ui";
import hljs from "highlight.js";

import { svelte } from "@lib/hljs/svelte";

hljs.registerLanguage("svelte", svelte);

const DEFAULT_LANGUAGES = ["javascript", "bash", "xml", "html", "json"];

const CodeBlock: React.FC<{
  children: string;
  lang?: string;
  sx?: ThemeUIStyleObject;
  codeStyle?: React.CSSProperties;
  codeClass?: string;
  Header?: React.FC;
}> = ({ children, lang, sx, codeStyle, codeClass, Header }) => {
  const { theme } = useThemeUI();

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const text = lang
    ? hljs.highlight(children, { language: lang === "vue" ? "html" : lang })
        .value
    : hljs.highlightAuto(children, DEFAULT_LANGUAGES).value;

  return (
    <Flex as="pre" sx={sx}>
      {Header ? <Header /> : null}
      <code
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        className={`hljs${codeClass ? ` ${codeClass}` : ""}`}
        style={{
          overflowX: "auto",
          padding: "3px 5px",
          borderRadius: "6px",
          border: "1px solid",
          borderColor: String(theme.colors?.textClear),
          ...codeStyle,
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </Flex>
  );
};

export default CodeBlock;
