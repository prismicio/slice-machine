import { FC, ReactNode } from "react";
import clsx from "clsx";

import { TableRowProvider } from "./TableRowContext";

import * as styles from "./TableBody.css";

type TableBodyProps = Readonly<{
  children?: ReactNode;
  className?: string;
}>;

export const TableBody: FC<TableBodyProps> = ({ children, className }) => {
  return (
    <TableRowProvider value="body">
      <tbody className={clsx(styles.root, className)}>{children}</tbody>
    </TableRowProvider>
  );
};
