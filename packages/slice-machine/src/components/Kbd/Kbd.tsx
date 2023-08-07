import { FC, ReactNode } from "react";

import * as styles from "./Kbd.css";

export const Kbd: FC<{ children: ReactNode }> = ({ children }) => (
  <kbd className={styles.root}>{children}</kbd>
);
