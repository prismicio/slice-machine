import { FC, ReactNode } from "react";
import clsx from "clsx";

import * as styles from "./Table.css";

type TableProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export const Table: FC<TableProps> = ({ children, className }) => {
  return (
    <div className={clsx(styles.root, className)}>
      <table className={clsx(styles.table)}>{children}</table>
    </div>
  );
};
