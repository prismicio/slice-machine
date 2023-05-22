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
      onClick={(event) => {
        if (!onClick) {
          return;
        }

        const target = event.target as HTMLElement;
        const isClickOnTableRow = !!target?.closest("tr");

        // Prevent a click event propagation from outside of the table DOM structure
        // E.g.: Dropdown menu item selection that will trigger this onClick function
        if (isClickOnTableRow) {
          onClick(event);
        }
      }}
    >
      {children}
    </tr>
  );
};
