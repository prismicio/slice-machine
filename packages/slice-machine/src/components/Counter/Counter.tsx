import { FC, PropsWithChildren, ReactNode } from "react";

import * as styles from "./Counter.css";

export type CounterProps = PropsWithChildren<{
  backgroundIcon: ReactNode;
}>;

export const Counter: FC<CounterProps> = (props) => {
  const { backgroundIcon, children } = props;

  return (
    <div className={styles.root}>
      {backgroundIcon}
      <span className={styles.count}>{children}</span>
    </div>
  );
};
