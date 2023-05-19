import { createContext, useContext } from "react";

type TableRowScope = "head" | "body";

const TableRowContext = createContext<TableRowScope>("body");

export function useTableRowScope() {
  return useContext(TableRowContext);
}

export const TableRowProvider = TableRowContext.Provider;
