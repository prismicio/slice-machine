import { FC, PropsWithChildren } from "react";

import { FlowerBackgroundIcon } from "@/icons/FlowerBackgroundIcon";

import styles from "./Count.module.css";

export const Count: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div className={styles.root}>
      <FlowerBackgroundIcon />
      <span className={styles.count}>{children}</span>
    </div>
  );
};
