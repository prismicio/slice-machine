import React from 'react'
import CodeBlock from '../CodeBlock'

const wrapRepeatable = (code) =>
`
<div v-for="(item, i) in slice.items" :key="\`slice-item-\${i}\`">    
  ${code}
</div>
`

const createCodeFromTag = (tag) => (fieldText) => `<${tag} :field="${fieldText}" />`
const createPrismicLink = (fieldText) => `<prismic-link :field="${fieldText}">My Link</prismic-link>`
const createDefaultField = (tag = 'span') => (fieldText) => `<${tag}>{{ ${fieldText} }}</${tag}>`

const codeByWidgetType = (Widgets) => ({
  [Widgets.ContentRelationship?.CUSTOM_NAME]:createPrismicLink,
  [Widgets.LinkToMedia?.CUSTOM_NAME]: createPrismicLink,
  [Widgets.UID?.TYPE_NAME]: (fieldText) => `<span>{{ ${fieldText} }}</span>`,
  [Widgets.StructuredText?.TYPE_NAME]: createCodeFromTag('prismic-rich-text'),
  [Widgets.Image?.TYPE_NAME]: createCodeFromTag('prismic-image'),
  [Widgets.Link?.TYPE_NAME]: createPrismicLink,
  [Widgets.Select?.TYPE_NAME]: createDefaultField(),
  [Widgets.Boolean?.TYPE_NAME]: (fieldText) => `<span>{{ ${fieldText} ? 'true' : 'false' }}</span>`,
  [Widgets.Date?.TYPE_NAME]: (fieldText) => `<span>{{ ${fieldText} }}</span>`,
  [Widgets.Timestamp?.TYPE_NAME]: createDefaultField(),
  [Widgets.Embed?.TYPE_NAME]: createCodeFromTag('prismic-embed'),
  [Widgets.Number?.TYPE_NAME]: createDefaultField(),
  [Widgets.GeoPoint?.TYPE_NAME]: createDefaultField(),
  [Widgets.Color?.TYPE_NAME]: (fieldText) => `<span :style="\`color: \${${fieldText}}\`">Some Text</span>`,
  [Widgets.Text?.TYPE_NAME]: createDefaultField(),
})

const toVue = ({ Widgets, item, typeName, renderHintBase, isRepeatable }) => {
  const hintBase = renderHintBase({ item })
  const maybeCodeRenderer = codeByWidgetType(Widgets)[typeName]
  const code = maybeCodeRenderer ? maybeCodeRenderer(hintBase) : null
  const withRepeat = isRepeatable ? wrapRepeatable(code) : code

  return <CodeBlock className="language-html">{withRepeat}</CodeBlock>
}

export default toVue;