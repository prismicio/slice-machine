import React from "react";
import CodeBlock from "../CodeBlock";

// const DOCS_README = 'https://github.com/prismicio/prismic-reactjs';

const wrapRepeatable = (code: string): string =>
  `
{ slice?.items?.map((item, i) => ${code}) }
`;

const createDefaultField =
  (tag = "span") =>
  (fieldText: string, useKey?: boolean) =>
    `<${tag} ${useKey ? appendKey(fieldText) : ""}>{ ${fieldText} }</${tag}>`;

const handleDateCode = (fieldText: string, useKey?: boolean): string =>
  `
/* import { Date as ParseDate } from 'prismic-reactjs' */
<span ${useKey ? appendKey(fieldText) : ""}>{ ParseDate(${fieldText}) }</span>
`;

const handleLinkCode = (fieldText: string, useKey?: boolean): string =>
  `
/* import { Link } from 'prismic-reactjs' */
<a ${
    useKey ? appendKey(fieldText) : ""
  } href={Link.url(${fieldText})}>My Link</a>
`;

const handleEmbedCode = (fieldText: string, useKey?: boolean): string =>
  `
// you might want to use a lib here (eg. react-oembed-container)
<div ${
    useKey ? appendKey(fieldText) : ""
  } dangerouslySetInnerHTML={{ __html: ${fieldText} }} />
`;

const appendKey = (id: string): string => `key={\`${id}-\${i}\`}`;

const codeByWidgetType = (
  Widgets: Record<string, { CUSTOM_NAME: string; TYPE_NAME: string }>
): Record<
  string,
  (fieldText: string, useKey?: boolean | undefined) => string
> => ({
  [Widgets.ContentRelationship?.CUSTOM_NAME]: (
    fieldText: string,
    useKey?: boolean
  ) => handleLinkCode(fieldText, useKey),

  [Widgets.LinkToMedia?.CUSTOM_NAME]: (fieldText: string, useKey?: boolean) =>
    handleLinkCode(fieldText, useKey),

  [Widgets.UID?.TYPE_NAME]: (fieldText: string) =>
    `<span>{{ ${fieldText} }}</span>`,

  [Widgets.StructuredText?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<RichText render={${fieldText}} ${useKey ? appendKey("rich-text") : ""}/>`,

  [Widgets.Image?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<img src={${fieldText}.url} alt={${fieldText}.alt} ${
      useKey ? appendKey("img") : ""
    }/>`,

  [Widgets.Link?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    handleLinkCode(fieldText, useKey),

  [Widgets.Select?.TYPE_NAME]: createDefaultField(),
  [Widgets.Boolean?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<span ${
      useKey ? appendKey("bool") : ""
    }> { ${fieldText} ? 'true' : 'false' }</span>`,

  [Widgets.Date?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    handleDateCode(fieldText, useKey),

  [Widgets.Timestamp?.TYPE_NAME]: createDefaultField(),

  [Widgets.Embed?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    handleEmbedCode(fieldText, useKey),

  [Widgets.Number?.TYPE_NAME]: createDefaultField(),

  [Widgets.GeoPoint?.TYPE_NAME]: createDefaultField(),

  [Widgets.Color?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<span  ${
      useKey ? appendKey("color") : ""
    } style={{ color: ${fieldText} }}>Some Text</span>`,

  [Widgets.Text?.TYPE_NAME]: createDefaultField(),
});

const toReact: React.FC<{
  Widgets: Record<string, { CUSTOM_NAME: string; TYPE_NAME: string }>;
  item: any;
  typeName: string;
  renderHintBase: any;
  isRepeatable: boolean;
}> = ({ Widgets, item, typeName, renderHintBase, isRepeatable }) => {
  const hintBase = renderHintBase({ item });

  const maybeCodeRenderer = codeByWidgetType(Widgets)[typeName];
  const code = maybeCodeRenderer ? maybeCodeRenderer(hintBase) : "";
  const withRepeat = isRepeatable ? wrapRepeatable(code) : code;

  return <CodeBlock>{withRepeat}</CodeBlock>;
};

export default toReact;
