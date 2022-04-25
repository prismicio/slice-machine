import React from 'react';
import { RichText, Elements } from '@prismicio/react';

// -- Function to add unique key to props
const propsWithUniqueKey = function(props, key) {
  return Object.assign(props || {}, { key });
};

// -- HTML Serializer
const htmlSerializer = function(type, element, content, children, key) {

  var props = {};
  console.log(element)

  switch(element.data?.label) {
      
    case Elements.heading1: // Heading 1
      return React.createElement('h1', propsWithUniqueKey(props, key), children);
      
    case Elements.heading2: // Heading 2
      return React.createElement('h2', propsWithUniqueKey(props, key), children);
      
    case Elements.heading3: // Heading 3
      props = Object.assign({
        className: 'mt-10 text-sm font-medium text-gray-900',
      })
      return React.createElement('h3', propsWithUniqueKey(props, key), children);
      
    case Elements.heading4: // Heading 4
      return React.createElement('h4', propsWithUniqueKey(props, key), children);
      
    case Elements.heading5: // Heading 5
      return React.createElement('h5', propsWithUniqueKey(props, key), children);
      
    case Elements.heading6: // Heading 6
      return React.createElement('h6', propsWithUniqueKey(props, key), children);
      
    case Elements.paragraph: // Paragraph
      return React.createElement('p', propsWithUniqueKey(props, key), children);
      
    case Elements.preformatted: // Preformatted
      return React.createElement('pre', propsWithUniqueKey(props, key), children);
      
    case Elements.strong: // Strong
      return React.createElement('strong', propsWithUniqueKey(props, key), children);
      
    case Elements.em: // Emphasis
      return React.createElement('em', propsWithUniqueKey(props, key), children);
      
    case listItem: // Unordered List Item
      props = Object.assign({
        className: 'text-gray-600',
      })
      return React.createElement('li', propsWithUniqueKey(props, key), children);
      
    case oListItem: // Ordered List Item
      return React.createElement('li', propsWithUniqueKey(props, key), children);
      
    case list: // Unordered List
    props = Object.assign({
      className: 'pl-4 list-disc text-sm space-y-2 mt-4',
    })
      return React.createElement('ul', propsWithUniqueKey(props, key), children);
      
    case Elements.oList: // Ordered List
      return React.createElement('ol', propsWithUniqueKey(props, key), children);


    default: // Always include a default that returns null
      return null;
  }
};

export default htmlSerializer
