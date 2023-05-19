import { FC, MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";

import { useTableRowScope } from "./TableRowContext";

import * as styles from "./TableRow.css";

type TableRowProps = Readonly<{
  children?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
}>;

export const TableRow: FC<TableRowProps> = ({
  children,
  className,
  onClick,
}) => {
  const scope = useTableRowScope();

  return (
    <tr
      className={clsx(
        styles.root,
        {
          [styles.tableRowClickable]: !!onClick,
          [styles.tableRowBody]: scope === "body",
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};
