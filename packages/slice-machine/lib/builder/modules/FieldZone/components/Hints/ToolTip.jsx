import React from 'react';

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
    transition: 'opacity 0.5s',
    fontSize: 12,
    ...rest.style,
  };
  return (<div style={style} {...rest} />);
}

export default Tooltip;