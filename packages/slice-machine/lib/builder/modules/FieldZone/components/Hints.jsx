import React, { useRef, useState, useEffect } from 'react';
import { MdTranslate } from 'react-icons/md';

const Tooltip = ({ open, mouse, ...rest}) => {
  const width = 100
  const style = {
    visibility: open ? 'visible' : 'hidden',
    opacity: open ? 0.8 : 0,
    transform: `translate(${mouse.x - (width/2)}px, ${mouse.y - 40}px)`,
    width: width + 'px',
    backgroundColor: '#555',
    color: '#fff',
    textAlign: 'center',
    padding: '5px 0',
    borderRadius: '6px',
    position: 'absolute',
    zIndex: 1,
    transition: 'opacity 0.3s',
    ...rest.style,
  };
  return (<div style={style} {...rest} />);
}

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
  const [showTip, toggleTip] = useState(false);
  const DEFAULT_MSG = "Click to Copy";
  const [msg, changeMessage] = useState(DEFAULT_MSG);
  const [coords, setCoords] = useState({x: 0, y: 0 });

  const copy = (event) => {
    console.log(event);
    const text = ref.current.textContent
    navigator.clipboard.writeText(text).then(() => {
      changeMessage("Copied :D")
      setTimeout(() => changeMessage(DEFAULT_MSG), 2000);
    });
  };

  const handleMouseEnter = (event) => {
    const { left, top } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = event;
    setCoords({ x: clientX - left, y: clientY - top })
    changeMessage(DEFAULT_MSG)
    toggleTip(true);
  };

  const handleMouseMove = (event) => {
    const {left, top } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = event;
    setCoords({ x: clientX - left, y: clientY - top })
  }

  return (<div
    style={{ position: 'relative' }}
    onClick={copy}
    onMouseEnter={handleMouseEnter}
    onMouseMove={handleMouseMove}
    onMouseLeave={() => {
      toggleTip(false)
      changeMessage(DEFAULT_MSG);
    }}>
    <Tooltip open={showTip} mouse={coords}>{msg}</Tooltip>
    <code 
      style={style}
      ref={ref}
      {...props}
    />
  </div>);
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
  {'{() => '}
  <Green>{`slice.${modelFieldName}.${key}`}</Green>
  {'}'}
</CodeBlock>)

const toVue = (item, modelFieldName, key) => {
  const component = toPrismicVueComponentName(item.value.type);
  return component ? formatedVue(component, modelFieldName, key) : formatedDefaultVue(modelFieldName, key);
}

const toPrismicReactLink = (modelFieldName, key) => {
  return <CodeBlock>
    {'{() => '}
    <Blue>Prismic.Link.url(</Blue>
    <Green>{`slice.${modelFieldName}.${key}`}</Green>
    <Blue>)</Blue>
    {'}'}
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
  {'{() => '}
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