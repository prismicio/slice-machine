import React from 'react'
import CodeBlock from '../CodeBlock'

// const DOCS_README = 'https://github.com/prismicio/prismic-reactjs';

const wrapRepeatable = (code) =>
`
{ slice?.items?.map((item, i) => ${code}) }
`

const createDefaultField = (tag = 'span') => (fieldText, useKey) => `<${tag} ${useKey ? appendKey(fieldText) : ''}>{ ${fieldText} }</${tag}>`

const handleDateCode = (fieldText, useKey) =>
`
/* import { Date as ParseDate } from 'prismic-reactjs' */
<span ${useKey ? appendKey(fieldText) : ''}>{ ParseDate(${fieldText}) }</span>
`

const handleLinkCode = (fieldText, useKey) =>
`
/* import { Link } from 'prismic-reactjs' */
<a ${useKey ? appendKey(fieldText) : ''} href={Link.url(${fieldText})}>My Link</a>
`

const handleEmbedCode = (fieldText, useKey) =>
`
// you might want to use a lib here (eg. react-oembed-container)
<div ${useKey ? appendKey(fieldText) : ''} dangerouslySetInnerHTML={{ __html: ${fieldText} }} />
`

const appendKey = (id) => `key={\`${id}-\${i}\`}`

const codeByWidgetType = (Widgets) => ({
  [Widgets.ContentRelationship?.CUSTOM_NAME]: (fieldText, useKey) => `<span>{{ ${fieldText} }} TODO</span>`,
  [Widgets.UID?.TYPE_NAME]: (fieldText) => `<span>{{ ${fieldText} }}</span>`,
  [Widgets.StructuredText?.TYPE_NAME]: (fieldText, useKey) => `<RichText render={${fieldText}} ${useKey ? appendKey('rich-text') : ''}/>`,
  [Widgets.Image?.TYPE_NAME]: (fieldText, useKey) => `<img src={${fieldText}.url} alt={${fieldText}.alt} ${useKey ? appendKey('img') : ''}/>`,
  [Widgets.Link?.TYPE_NAME]: (fieldText, useKey) => handleLinkCode(fieldText, useKey),
  [Widgets.Select?.TYPE_NAME]: createDefaultField(),
  [Widgets.Boolean?.TYPE_NAME]: (fieldText, useKey) => `<span ${useKey ? appendKey('bool') : ''}> { ${fieldText} ? 'true' : 'false' }</span>`,
  [Widgets.Date?.TYPE_NAME]: (...args) => handleDateCode(...args),
  [Widgets.Timestamp?.TYPE_NAME]: createDefaultField(),
  [Widgets.Embed?.TYPE_NAME]: (...args) => handleEmbedCode(...args),
  [Widgets.Number?.TYPE_NAME]: createDefaultField(),
  [Widgets.GeoPoint?.TYPE_NAME]: createDefaultField(),
  [Widgets.Color?.TYPE_NAME]: (fieldText, useKey) => `<span  ${useKey ? appendKey('color') : ''} style={{ color: ${fieldText} }}>Some Text</span>`,
  [Widgets.Text?.TYPE_NAME]: createDefaultField(),
})

const toReact = ({ Widgets, item, typeName, renderHintBase, isRepeatable }) => {
  const hintBase = renderHintBase({ item })

  const maybeCodeRenderer = codeByWidgetType(Widgets)[typeName]
  const code = maybeCodeRenderer ? maybeCodeRenderer(hintBase) : null
  const withRepeat = isRepeatable ? wrapRepeatable(code) : code

  return <CodeBlock className="language-jsx">{withRepeat}</CodeBlock>
}

export default toReact;