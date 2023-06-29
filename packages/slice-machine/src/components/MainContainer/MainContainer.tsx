import { clsx } from "clsx";
import type { FC, PropsWithChildren } from "react";

import * as styles from "./MainContainer.css";

export const MainContainer: FC<PropsWithChildren> = (props) => (
  <div {...props} className={clsx(styles.root)} />
);

export const MainContainerContent: FC<PropsWithChildren> = ({ children }) => (
  <div className={styles.content}>{children}</div>
);
