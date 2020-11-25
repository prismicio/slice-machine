import React from 'react';
import CodeBlock from './CodeBlock';

const DOCS_README = 'https://github.com/prismicio/prismic-vue';

const toPrismicVueComponentName = (type) => {
  switch(type) {
    case "StructuredText": return 'prismic-rich-text';
    case "Link": return "prismic-link";
    case "Image": return "prismic-image";
    case "Embed": return "prismic-embed";
    // other types / missing components
    case "Select": case "GeoPoint": case "Text": case "TimeStamp": 
    case "Number": case "Boolean":  case "Color": case "Group":
    case "UID": case "Date":    
    // any-more?
    default: return ""; // what should be a sane default?
  } 
}

const formatedVue = (component, modelFieldName, key) => (
  {
    code:`<${component} :field="slice.${modelFieldName}.${key}" />`,
    language: 'html',
    docs: DOCS_README,
  }
);

const formatedDefaultVue = (modelFieldName, key) => (
  {
    code: `<span>{{slice.${modelFieldName}.${key}}}</span>`,
    language: 'html',
  }
);

const toVue = (item, modelFieldName, key) => {
  const component = toPrismicVueComponentName(item.value.type);
  const { code, language, docs } = component ? formatedVue(component, modelFieldName, key) : formatedDefaultVue(modelFieldName, key);

  const cn = `language-${language}`;
// why not return language and code?
  return (<CodeBlock className={cn} docs={docs}>{code}</CodeBlock>);
}

export default toVue;