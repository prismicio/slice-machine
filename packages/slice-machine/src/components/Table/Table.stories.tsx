import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon as IconEditor,
  Text,
} from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton";
import { Table } from "./Table";
import { TableBody } from "./TableBody";
import { TableCell } from "./TableCell";
import { TableHead } from "./TableHead";
import { TableRow } from "./TableRow";

type Story = StoryObj<typeof meta>;

const TableExample: FC = () => {
  const data = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    name:
      index === 3 || index === 7
        ? `The very very long page name that is annoying ${index}`
        : `My name ${index}`,
    apiId:
      index === 5 || index === 7
        ? `very_very_very_long_api_id_${index}`
        : `api_id_${index}`,
    limit: index % 2 ? "repeatable" : "single",
  }));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <Icon name="fieldList" />
          </TableCell>
          <TableCell>Name</TableCell>
          <TableCell>API ID</TableCell>
          <TableCell>Limit</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(({ id, name, apiId, limit }) => (
          <TableRow
            key={id}
            onClick={() => {
              console.log(`Table row clicked for ${name}`);
            }}
          >
            <TableCell>
              {limit === "single" ? (
                <Icon name="unique" />
              ) : (
                <Icon name="reusable" />
              )}
            </TableCell>
            <TableCell>
              <span style={{ fontWeight: 600 }}>{name}</span>
            </TableCell>
            <TableCell>{apiId}</TableCell>
            <TableCell>{limit === "single" ? "Unique" : "Reusable"}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <IconButton icon="kebabDots" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    startIcon={<IconEditor name="edit" />}
                    onSelect={() => {
                      console.log(`Rename clicked for ${name}`);
                    }}
                  >
                    <Text>Rename</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    startIcon={<IconEditor color="tomato11" name="delete" />}
                    onSelect={() => {
                      console.log(`Remove clicked for ${name}`);
                    }}
                  >
                    <Text color="tomato11">Remove</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const meta = {
  component: TableExample,
} satisfies Meta<typeof TableExample>;

export default meta;

export const Default = {} satisfies Story;
