import { useEffect, useState, useRef } from "react";

function useThrottle<T>(
  cb: () => T,
  limit: number,
  args: ReadonlyArray<unknown>
): T {
  const [throttledValue, setThrottledValue] = useState(cb());
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(function () {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(cb());
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, ...args]);

  return throttledValue;
}

export default useThrottle;
