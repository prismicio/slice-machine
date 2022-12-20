import {
  type DependencyList,
  type RefCallback,
  useCallback,
  useRef,
} from "react";

export function useElementSize(
  callback: (size: ResizeObserverSize) => void,
  deps: DependencyList
): RefCallback<Element> {
  const resizeObserverRef = useRef<ResizeObserver>();
  return useCallback((element: Element | null) => {
    resizeObserverRef.current?.disconnect();
    if (element === null) return;
    resizeObserverRef.current = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect;
      callback({ blockSize: height, inlineSize: width });
    });
    resizeObserverRef.current.observe(element);
  }, deps);
}
