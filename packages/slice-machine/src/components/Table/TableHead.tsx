import { FC, ReactNode } from "react";
import clsx from "clsx";

import { TableRowProvider } from "./TableRowContext";

import * as styles from "./TableHead.css";

type TableHeadProps = Readonly<{
  children?: ReactNode;
  className?: string;
}>;

export const TableHead: FC<TableHeadProps> = ({ children, className }) => {
  return (
    <TableRowProvider value="head">
      <thead className={clsx(styles.root, className)}>{children}</thead>
    </TableRowProvider>
  );
};
