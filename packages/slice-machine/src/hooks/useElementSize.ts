import {
  type DependencyList,
  type RefCallback,
  useCallback,
  useRef,
} from "react";

export function useElementSize<E extends Element>(
  callback: (size: ResizeObserverSize, element: E) => void,
  deps: DependencyList
): RefCallback<E> {
  const resizeObserverRef = useRef<ResizeObserver>();
  return useCallback((element: E | null) => {
    resizeObserverRef.current?.disconnect();
    if (element === null) return;
    resizeObserverRef.current = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect;
      callback({ blockSize: height, inlineSize: width }, element);
    });
    resizeObserverRef.current.observe(element);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
