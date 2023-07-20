import { MutableRefObject, useEffect } from "react";

export default function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: MutableRefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    function handleClicksOutside(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        ref.current?.contains(event.target) === false
      ) {
        handler();
      }
    }

    if (ref.current !== null) {
      document.addEventListener("mousedown", handleClicksOutside);
    }

    return () => document.removeEventListener("mousedown", handleClicksOutside);
  }, [ref, handler]);
}
