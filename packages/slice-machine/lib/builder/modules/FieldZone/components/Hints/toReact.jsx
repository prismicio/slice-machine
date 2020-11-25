import React from 'react';
import CodeBlock from './CodeBlock';


const DOCS_README = 'https://github.com/prismicio/prismic-reactjs';

const formatedDefaultReact = (modelFieldName, key) => (
  {
    code: `<span>{slice.${modelFieldName}.${key}}</span>`,
    language: 'jsx',
  }
)
const toPrismicReactLink = (modelFieldName, key) => (
  {
    code: `{() => Prismic.Link.url(slice.${modelFieldName}.${key})}`,
    language: 'javascript',
    docs: DOCS_README,
  }
)

const toPrismicReactRichText = (modelFieldName, key) => (
  {
    code: `<Prismic.RichText render={slice.${modelFieldName}.${key}} />`,
    language: 'jsx',
    docs: DOCS_README,
  }
);

const toPrismicReactDate = (modelFieldName, key) => (
  {
    code: `{() => Prismic.Date(slice.${modelFieldName}.${key})}`,
    language: 'javascript',
    docs: DOCS_README,
  }
)

const toReactComponent = (item, modelFieldName, key) => {
  switch(item.value.type) {
    case "Link": return toPrismicReactLink(modelFieldName, key);
    case "StructuredText": return toPrismicReactRichText(modelFieldName, key)
    case "Date": return toPrismicReactDate(modelFieldName, key)
    default: return formatedDefaultReact(modelFieldName, key);
  }
}

const toReact = (item, modelFieldName, key) => {
  // note we'll have to fix key to change key-name to keyName in react
  const { code, language, docs } = toReactComponent(item, modelFieldName, key);
  const cn = `language-${language}`
  return (<CodeBlock className={cn} docs={docs}>{code}</CodeBlock>);
}

export default toReact;