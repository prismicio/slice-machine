import { FC } from "react";
import clsx from "clsx";

import * as styles from "./Divider.css";

type DividerProps = {
  variant?: "dashed";
  className?: string;
};

export const Divider: FC<DividerProps> = (props) => {
  const { variant = "dashed", className } = props;

  return <hr className={clsx(styles.variants[variant], className)} />;
};
