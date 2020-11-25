import React, { useRef, useState } from 'react';
import { useThemeUI, Text, Link, Box } from 'theme-ui';
import Prism from '@theme-ui/prism';
import ToolTip from './ToolTip';

const CodeBlock = ({ docs, ...props }) => {
  const DEFAULT_MSG = "Click to Copy";
  const DEFAULT_DELAY = 2000; 
  const context = useThemeUI();
  const ref = useRef(null);
  const [showTip, toggleTip] = useState(false);
  
  const [msg, changeMessage] = useState(DEFAULT_MSG);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [clock, setClock] = useState(0);

  const copy = (event) => {
    console.log(event);
    const text = ref.current.textContent
    navigator.clipboard.writeText(text).then(() => {
      changeMessage("Copied :D")
      toggleTip(true);
      setTimeout(() => changeMessage(DEFAULT_MSG), DEFAULT_DELAY);
    });
  };

  const handleMouseEnter = (event) => {
    const { left, top } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = event;
    setCoords({ x: clientX - left, y: clientY - top })
    changeMessage(DEFAULT_MSG)

    const timer = !clock ? setTimeout(() => toggleTip(true), DEFAULT_DELAY) : 0;
    setClock(timer);
  };

  const handleMouseMove = (event) => {
    const {left, top } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = event;
    setCoords({ x: clientX - left, y: clientY - top })
  }

  const handleMouseLeave = () => {
    clearTimeout(clock)
    toggleTip(false);
    setClock(0);
    changeMessage(DEFAULT_MSG);
  }

  return (
    <span>
      <Text
        theme={context.theme}
        as="code"
        variant="hint"
        onClick={copy}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <ToolTip open={showTip} mouse={coords}>{msg}</ToolTip>
        
        <div ref={ref}><Prism {...props} /></div>
      </Text>
      {docs && (<Link variant="hint" href={docs} target="_blank" rel="noopener noreferrer">View doc</Link>)}
    </span>
  );
}

export default CodeBlock;
