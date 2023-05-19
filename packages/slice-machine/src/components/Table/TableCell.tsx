import { FC, ReactNode } from "react";
import clsx from "clsx";

import { useTableRowScope } from "./TableRowContext";

import * as styles from "./TableCell.css";

type TableCellProps = Readonly<{
  children?: ReactNode;
  className?: string;
}>;

export const TableCell: FC<TableCellProps> = ({ children, className }) => {
  const scope = useTableRowScope();
  const CellComponent = scope === "head" ? "th" : "td";

  return (
    <CellComponent
      className={clsx(styles.root, className, {
        [styles.tableHeadCell]: scope === "head",
        [styles.tableDataCell]: scope === "body",
      })}
    >
      <div className={clsx(styles.tableCellContent)}>{children}</div>
    </CellComponent>
  );
};
