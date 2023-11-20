import { FC, PropsWithChildren } from "react";

import { FlowerBackgroundIcon } from "@src/icons/FlowerBackgroundIcon";

import * as styles from "./Counter.css";

export type CounterProps = PropsWithChildren;

export const Counter: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div className={styles.root}>
      <FlowerBackgroundIcon />
      <span className={styles.count}>{children}</span>
    </div>
  );
};
