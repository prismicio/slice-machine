import { useEffect, useState } from "react";

type useDelayedActionArgs = {
  condition: boolean;
  action: () => void;
  delay: number;
};

type Timer = ReturnType<typeof setTimeout> | null;

export function useDelayedAction({
  condition,
  action,
  delay,
}: useDelayedActionArgs) {
  const [timer, setTimer] = useState<Timer>(null);
  useEffect(() => {
    if (condition && timer === null) {
      const timerId = setTimeout(action, delay);
      setTimer(timerId);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
        setTimer(null);
      }
    };
  }, [condition, action, delay, timer, setTimer]);
}
