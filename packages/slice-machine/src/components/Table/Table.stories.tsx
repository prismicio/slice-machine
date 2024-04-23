import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  IconButton,
} from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { Table, TableBody, TableHead, TableCell, TableRow } from "./Table";
import { UniqueIcon } from "../../icons/UniqueIcon";
import { ReusableIcon } from "../../icons/ReusableIcon";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Table,
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof Table>;

export default meta;

const data = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  label:
    index === 3 || index === 7
      ? `The very very long label that is annoying ${index}`
      : `My label ${index}`,
  apiId:
    index === 5 || index === 7
      ? `very_very_very_long_api_id_${index}`
      : `api_id_${index}`,
  repeatable: !!(index % 2),
}));

export const Default = {
  args: {
    children: (
      <>
        <TableHead>
          <TableRow>
            <TableCell>
              <Icon name="notes" size="medium" />
            </TableCell>
            <TableCell>Label</TableCell>
            <TableCell>API ID</TableCell>
            <TableCell>Limit</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(({ id, label, apiId, repeatable }) => (
            <TableRow
              key={id}
              onClick={() => {
                console.log(`Table row clicked for ${label}`);
              }}
            >
              <TableCell>
                {repeatable ? <ReusableIcon /> : <UniqueIcon />}
              </TableCell>
              <TableCell>{label}</TableCell>
              <TableCell>{apiId}</TableCell>
              <TableCell>{repeatable ? "Reusable" : "Single"}</TableCell>
              <TableCell>
                <DropdownMenu modal>
                  <DropdownMenuTrigger>
                    <IconButton icon="moreVert" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      startIcon={<Icon name="edit" />}
                      onSelect={() => {
                        console.log(`Rename clicked for ${label}`);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      color="tomato"
                      startIcon={<Icon name="delete" />}
                      onSelect={() => {
                        console.log(`Remove clicked for ${label}`);
                      }}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </>
    ),
  },
} satisfies Story;
