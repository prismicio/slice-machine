import React from "react";
import CodeBlock from "../CodeBlock";

const wrapRepeatable = (code) =>
  `{#each slices.item as item} {${code}} {/each}`;

const richTextCode = (fieldText) =>
  `{@html PrismicDom.RichText.asHtml(${fieldText}, linkResolver)}`;

const linkCode = (fieldText) =>
  `<a href={PrismicDom.RichText.Link.url(${fieldText}, linkResolver)}> My Link</a>`;

const dateCode = (fieldText) =>
  `<time datetime={${fieldText}}>{${fieldText}}</time>`;

const defaultCode = (fieldText) => `<span>{ ${fieldText} }</span>`;
const codeByWidgetType = (Widgets) => ({
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
  [Widgets.GeoPoint?.TYPE_NAME]: (fieldText) =>
    `<span>({${fieldText}.latitude}, {${fieldText}.longitude})</span>`,
  [Widgets.Image?.TYPE_NAME]: (fieldText) =>
    `<img src={${fieldText}.url} alt={${fieldText}.alt} />`,
  [Widgets.Boolean?.TYPE_NAME]: (fieldText) =>
    `{#if ${fieldText}} <p>true</p> {:else} <p>false</p>{/if}`,
  [Widgets.Embed?.TYPE_NAME]: (fieldText) => `{@html ${fieldText}.html}`,
  [Widgets.Color?.TYPE_NAME]: (fieldText) =>
    `<span style={\`color: \${${fieldText}};\`}}>Some Text</span>`,
});

export default ({ Widgets, item, typeName, renderHintBase, isRepeatable }) => {
  const hintBase = renderHintBase({ item });
  const maybeCodeRenderer = codeByWidgetType(Widgets)[typeName];
  const code = maybeCodeRenderer ? maybeCodeRenderer(hintBase) : null;
  const withRepeat = isRepeatable ? wrapRepeatable(code) : code;

  return <CodeBlock className="language-html">{withRepeat}</CodeBlock>;
};
