import { findFocusableAncestor } from "@prismicio/editor-support/DOM";
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

export const TableRow: FC<TableRowProps> = ({ children, onClick }) => {
  const section = useTableSection();

  return (
    <tr
      className={clsx(styles.row, {
        [styles.rowClickable]: !!onClick,
        [styles.bodyRow]: section === "body",
      })}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (!onClick || !event.currentTarget.contains(target)) return;
        const focusableAncestor = findFocusableAncestor(target);
        if (focusableAncestor?.contains(event.currentTarget) ?? true) {
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
