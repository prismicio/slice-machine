import { FC, PropsWithChildren } from "react";

import * as styles from "./Kbd.css";

export const Kbd: FC<PropsWithChildren> = ({ children }) => (
  <kbd className={styles.root}>{children}</kbd>
);
