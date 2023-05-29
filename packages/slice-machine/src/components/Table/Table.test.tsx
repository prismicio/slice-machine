// @vitest-environment jsdom

import { describe, test, vi } from "vitest";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@src/components/Table";
import { render, screen } from "test/__testutils__";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
vi.mock("next/router", () => require("next-router-mock"));

const renderTable = () => {
  const onClickFirstRow = vi.fn();

  return {
    ...render(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column A</TableCell>
            <TableCell>Column B</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow onClick={onClickFirstRow}>
            <TableCell>Cell 1 - A</TableCell>
            <TableCell>Cell 1 - B</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cell 2 - A</TableCell>
            <TableCell>Cell 2 - B</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
    onClickFirstRow,
  };
};

describe("Table", () => {
  test("should check that table data is visible", () => {
    renderTable();

    expect(screen.getByText("Column A")).toBeVisible();
    expect(screen.getByText("Column B")).toBeVisible();

    expect(screen.getByText("Cell 1 - A")).toBeVisible();
    expect(screen.getByText("Cell 1 - B")).toBeVisible();

    expect(screen.getByText("Cell 2 - A")).toBeVisible();
    expect(screen.getByText("Cell 2 - B")).toBeVisible();
  });

  test("should check that clicking on a table row call the onClick function", () => {
    const { onClickFirstRow } = renderTable();

    // Clicking on the first table row should trigger the call
    screen.getByText("Cell 1 - A").click();
    expect(onClickFirstRow).toHaveBeenCalledTimes(1);
    screen.getByText("Cell 1 - B").click();
    expect(onClickFirstRow).toHaveBeenCalledTimes(2);

    // Clicking anywhere else should not trigger the call
    screen.getByText("Column A").click();
    screen.getByText("Column B").click();
    screen.getByText("Cell 2 - A").click();
    screen.getByText("Cell 2 - B").click();
    expect(onClickFirstRow).toHaveBeenCalledTimes(2);
  });

  test("should check that the correct table cell element is rendered", () => {
    renderTable();

    expect(screen.getByText("Column A").closest("th")).toBeTruthy();
    expect(screen.getByText("Column B").closest("th")).toBeTruthy();

    expect(screen.getByText("Cell 1 - A").closest("td")).toBeTruthy();
    expect(screen.getByText("Cell 1 - B").closest("td")).toBeTruthy();
    expect(screen.getByText("Cell 2 - A").closest("td")).toBeTruthy();
    expect(screen.getByText("Cell 2 - B").closest("td")).toBeTruthy();
  });
});
