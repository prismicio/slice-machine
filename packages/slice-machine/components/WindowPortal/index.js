import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// Thank you David! https://codepen.io/davidgilbertson/pen/xPVMqp
function copyStyles(sourceDoc, targetDoc) {
  Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    if (styleSheet.cssRules) {
      const newStyleEl = sourceDoc.createElement('style');

      Array.from(styleSheet.cssRules).forEach(cssRule => {
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    }
  })
}

const WindowPortal = ({ children, onClose }) => {
  const [win, setWin] = useState(null)
  const [state, setState] = useState({ container: document.createElement('div'), isAppended: false })

  const _onClose = () => {
    if (win) {
      win.close()
      onClose()
    }
  }

  useEffect(() => {
    setWin(window.open('', '', 'width=600,height=500,left=200,top=200'))
  }, [])

  useEffect(() => {
    if (win) {
      copyStyles(document, win.document)
      win.document.body.appendChild(state.container)
      setState({ ...state, isAppended: true })
      win.addEventListener('beforeunload', _onClose)
      return () => win && win.removeEventListener('beforeunload', _onClose) || _onClose()
    }
  }, [win])

  return state.isAppended ? createPortal(children, state.container) : null
}

export default WindowPortal
