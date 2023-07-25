import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Thank you David! https://codepen.io/davidgilbertson/pen/xPVMqp
function copyStyles(sourceDoc, targetDoc) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
    if (styleSheet.cssRules) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const newStyleEl = sourceDoc.createElement("style");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      Array.from(styleSheet.cssRules).forEach((cssRule) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      targetDoc.head.appendChild(newStyleEl);
    }
  });
}

const WindowPortal = ({ children, onClose }) => {
  const [win, setWin] = useState(null);
  const [state, setState] = useState({
    container: document.createElement("div"),
    isAppended: false,
  });

  const _onClose = () => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (win) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        win.close();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        onClose();
      }, 100); // quick-fix safari
    }
  };

  useEffect(() => {
    setWin(window.open("", "", "width=600,height=500,left=200,top=200"));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (win) {
      copyStyles(document, win.document);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      win.document.body.appendChild(state.container);
      setState({ ...state, isAppended: true });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      win.addEventListener("beforeunload", _onClose);
      return () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
        (win && win.removeEventListener("beforeunload", _onClose)) ||
        _onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  return state.isAppended ? createPortal(children, state.container) : null;
};

export default WindowPortal;
