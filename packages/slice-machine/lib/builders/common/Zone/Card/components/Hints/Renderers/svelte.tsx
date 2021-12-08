import React from "react";
import CodeBlock from "../CodeBlock";

const wrapRepeatable = (code: string): string =>
  `{#each slices.item as item} {${code}} {/each}`;

const richTextCode = (fieldText: string): string =>
  `{@html PrismicDom.RichText.asHtml(${fieldText}, linkResolver)}`;

const linkCode = (fieldText: string): string =>
  `<a href={PrismicDom.Link.url(${fieldText}, linkResolver)}> My Link</a>`;

const dateCode = (fieldText: string): string =>
  `<time datetime={${fieldText}}>{${fieldText}}</time>`;

const defaultCode = (fieldText: string): string =>
  `<span>{ ${fieldText} }</span>`;

const codeByWidgetType = (Widgets: any): Record<string, any> => ({
  [Widgets.UID?.TYPE_NAME]: defaultCode,
  [Widgets.Text?.TYPE_NAME]: defaultCode,
  [Widgets.Select?.TYPE_NAME]: defaultCode,
  [Widgets.Number?.TYPE_NAME]: defaultCode,
  [Widgets.Date?.TYPE_NAME]: dateCode,
  [Widgets.Timestamp?.TYPE_NAME]: dateCode,
  [Widgets.StructuredText?.TYPE_NAME]: richTextCode,
  [Widgets.LinkToMedia?.CUSTOM_NAME]: linkCode,
  [Widgets.Link?.TYPE_NAME]: linkCode,
  [Widgets.ContentRelationship?.CUSTOM_NAME]: linkCode,
  [Widgets.GeoPoint?.TYPE_NAME]: (fieldText: string) =>
    `<span>({${fieldText}.latitude}, {${fieldText}.longitude})</span>`,
  [Widgets.Image?.TYPE_NAME]: (fieldText: string) =>
    `<img src={${fieldText}.url} alt={${fieldText}.alt} />`,
  [Widgets.Boolean?.TYPE_NAME]: (fieldText: string) =>
    `{#if ${fieldText}} <p>true</p> {:else} <p>false</p>{/if}`,
  [Widgets.Embed?.TYPE_NAME]: (fieldText: string) =>
    `{@html ${fieldText}.html}`,
  [Widgets.Color?.TYPE_NAME]: (fieldText: string) =>
    `<span style={\`color: \${${fieldText}};\`}>Some Text</span>`,
});

const renderSvelte: React.FC<{
  Widgets: any;
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

export default renderSvelte;
