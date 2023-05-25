import {
  type FC,
  type MouseEventHandler,
  type PropsWithChildren,
  createContext,
  useContext,
} from "react";
import { clsx } from "clsx";

import * as styles from "./Table.css";

export const Table: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.root}>
      <table className={styles.table}>{children}</table>
    </div>
  );
};

type TableSection = "head" | "body";

const TableSectionContext = createContext<TableSection>("body");

function useTableSection() {
  return useContext(TableSectionContext);
}

export const TableHead: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TableSectionContext.Provider value="head">
      <thead className={styles.head}>{children}</thead>
    </TableSectionContext.Provider>
  );
};

export const TableBody: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TableSectionContext.Provider value="body">
      <tbody className={styles.body}>{children}</tbody>
    </TableSectionContext.Provider>
  );
};

type TableRowProps = PropsWithChildren<{
  onClick?: MouseEventHandler<HTMLTableRowElement>;
}>;

const tableRowTag = "prismicTableRow";

export const TableRow: FC<TableRowProps> = ({ children, onClick }) => {
  const section = useTableSection();

  return (
    <tr
      data-tag={tableRowTag}
      className={clsx(styles.row, {
        [styles.rowClickable]: !!onClick,
        [styles.bodyRow]: section === "body",
      })}
      onClick={(event) => {
        if (!onClick) {
          return;
        }

        const target = event.target as HTMLElement;
        const isClickOnTableRow = !!target.closest(
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

export const TableCell: FC<PropsWithChildren> = ({ children }) => {
  const section = useTableSection();
  const CellComponent = section === "head" ? "th" : "td";

  return (
    <CellComponent className={styles.cell}>
      <div className={styles.cellContent}>{children}</div>
    </CellComponent>
  );
};
