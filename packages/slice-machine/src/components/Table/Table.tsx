import {
  createContext,
  FC,
  MouseEventHandler,
  ReactNode,
  useContext,
} from "react";
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

type TableSection = "head" | "body";

const TableSectionContext = createContext<TableSection>("body");

export function useTableSection() {
  return useContext(TableSectionContext);
}

type TableHeadProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export const TableHead: FC<TableHeadProps> = ({ children, className }) => {
  return (
    <TableSectionContext.Provider value="head">
      <thead className={clsx(styles.head, className)}>{children}</thead>
    </TableSectionContext.Provider>
  );
};

type TableBodyProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export const TableBody: FC<TableBodyProps> = ({ children, className }) => {
  return (
    <TableSectionContext.Provider value="body">
      <tbody className={clsx(styles.body, className)}>{children}</tbody>
    </TableSectionContext.Provider>
  );
};

type TableRowProps = Readonly<{
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
}>;

const tableRowTag = "prismicTableRow";

export const TableRow: FC<TableRowProps> = ({
  children,
  className,
  onClick,
}) => {
  const section = useTableSection();

  return (
    <tr
      data-tag={tableRowTag}
      className={clsx(
        styles.row,
        {
          [styles.rowClickable]: !!onClick,
          [styles.bodyRow]: section === "body",
        },
        className
      )}
      onClick={(event) => {
        if (!onClick) {
          return;
        }

        const target = event.target as HTMLElement;
        const isClickOnTableRow = !!target?.closest(
          `tr[data-tag=${tableRowTag}]`
        );

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

type TableCellProps = Readonly<{
  children?: ReactNode;
  className?: string;
}>;

export const TableCell: FC<TableCellProps> = ({ children, className }) => {
  const section = useTableSection();
  const CellComponent = section === "head" ? "th" : "td";

  return (
    <CellComponent className={clsx(styles.cell, className)}>
      <div className={clsx(styles.cellContent)}>{children}</div>
    </CellComponent>
  );
};
