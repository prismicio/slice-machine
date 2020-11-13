import React, { useRef } from 'react';

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

  return (<code style={style} ref={ref} {...props} onClick={copy} title="click to copy" />);
}

const Blue = (props) => (<span style={{ color: '#3B41BD'}} {...props} />);
const Orange = (props) => (<span style={{ color: '#EA6D46'}} {...props} />);
const Green = (props) => (<span style={{ color: '#3AB97A'}} {...props} />); 

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

const formatedVue = (component, modelFieldName, key) => (<CodeBlock>
  &lt;
  <Blue>{component}</Blue>
  {' '}
  <Orange>:field</Orange>
  =
  <Green>&quot;slice.{modelFieldName}.{key}&quot;</Green>
  {' '}
  /&gt;
</CodeBlock>);

const formatedDefaultVue = (modelFieldName, key) => (<CodeBlock>
  <Blue>{'<span>'}</Blue>
  <Orange>{'{{'}</Orange>
  <Green>{`slice.${modelFieldName}.${key}`}</Green>
  <Orange>{'}}'}</Orange>
  <Blue>{'</span>'}</Blue>
</CodeBlock>);

const formatedDefaultReact = (modelFieldName, key) => (<CodeBlock>
  <Blue>{'<span>'}</Blue>
  <Orange>{'{'}</Orange>
  <Green>{`slice.${modelFieldName}.${key}`}</Green>
  <Orange>{'}'}</Orange>
  <Blue>{'</span>'}</Blue>
</CodeBlock>)

const toVue = (item, modelFieldName, key) => {
  const component = toPrismicVueComponentName(item.value.type);
  return component ? formatedVue(component, modelFieldName, key) : formatedDefaultVue(modelFieldName, key);
}

const toPrismicReactLink = (modelFieldName, key) => {
  return <CodeBlock>
    {'{'}
    <Blue>Prismic.Link.url(</Blue>
    <Green>{`slice.${modelFieldName}.${key}`}</Green>
    <Blue>)</Blue>
    {"}"}
  </CodeBlock>
}

const toPrismicReactRichText = (modelFieldName, key) => (<CodeBlock>
  &lt;
  <Blue>Prismic.RichText</Blue>
  {' '}
  <Orange>render</Orange>
  =
  <Green>{`{slice.${modelFieldName}.${key}}`}</Green>
  {' '}
  /&gt;
</CodeBlock>);

const toPrismicReactDate = (modelFieldName, key) => (<CodeBlock>
  {'{'}
  <Blue>Prismic.Date(</Blue>
  <Green>{`slice.${modelFieldName}.${key}`}</Green>
  <Blue>)</Blue>
  {"}"}
</CodeBlock>);


const toReact  = (item, modelFieldName, key) => {
  switch(item.value.type) {
    case "Link": return toPrismicReactLink(modelFieldName, key);
    case "StructuredText": return toPrismicReactRichText(modelFieldName, key)
    case "Date": return toPrismicReactDate(modelFieldName, key)
    default: return formatedDefaultReact(modelFieldName, key);
  }
}

const hint = (framework, item, modelFieldName, key) => { 
  const isVue = framework === 'nuxt' || framework === 'vue' ;
  // const isReact = framework === 'react' || framework === 'next';
  return isVue ? toVue(item, modelFieldName, key) : toReact(item, modelFieldName, key);
}

export default hint;