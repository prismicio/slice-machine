import React, { useRef } from 'react';
import Prism from 'prismjs';

const CodeBlock = (props) => {
  const style = {
    color: '#667587',
    border: '1px solid #DFE1E5',
    boxSizing: 'border-box',
    borderRadius: '3px',
    background: '#F8F9FA',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '13px',
    padding: '1px 3px',
    // cursor: 'copy',
    cursor: 'pointer',
  };
  const ref = useRef(null);

  const copy = (event) => {
    const text = ref.current.textContent
    navigator.clipboard.writeText(text);
  }

  return (<code style={style} ref={ref} onClick={copy} title="click to copy" {...props} />);
}

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
  `<${component} :field="slice.${modelFieldName}.${key}" />`
);

const formatedDefaultVue = (modelFieldName, key) => (
  `<span>{{slice.${modelFieldName}.${key}}}</span>`
);

const formatedDefaultReact = (modelFieldName, key) => (
  `<span>{slice.${modelFieldName}.${key}}</span>`
)

const toVue = (item, modelFieldName, key) => {
  const component = toPrismicVueComponentName(item.value.type);
  const code = component ? formatedVue(component, modelFieldName, key) : formatedDefaultVue(modelFieldName, key);

  return (<CodeBlock dangerouslySetInnerHTML={{__html: Prism.highlight(code, Prism.languages.markup, 'markup') }} />);
}

const toPrismicReactLink = (modelFieldName, key) => (

  Prism.highlight(`() => Prismic.Link.url(slice.${modelFieldName}.${key})`, Prism.languages.js, 'js')
)

const toPrismicReactRichText = (modelFieldName, key) => (
  Prism.highlight(`<Prismic.RichText render={slice.${modelFieldName}.${key}} />`, Prism.languages.jsx, 'jsx')
);

const toPrismicReactDate = (modelFieldName, key) => (
  Prism.highlight(`() => Prismic.Date(slice.${modelFieldName}.${key})`, Prism.languages.js, 'js')
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
  const code = toReactComponent(item, modelFieldName, key);
  return (<CodeBlock dangerouslySetInnerHTML={{__html: code }} />);
}

const hint = (framework, item, modelFieldName, key) => { 
  const isVue = framework === 'nuxt' || framework === 'vue' ;
  // const isReact = framework === 'react' || framework === 'next';
  return isVue ? toVue(item, modelFieldName, key) : toReact(item, modelFieldName, key);
}

export default hint;