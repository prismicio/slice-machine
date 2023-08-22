import { Button, Switch } from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { List, ListHeader } from "./List";

type Story = StoryObj<typeof meta>;

const meta = {
  component: List,
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof List>;

export default meta;

export const Default = {
  args: {
    children: (
      <ListHeader
        actions={<Button startIcon="add">Add</Button>}
        toggle={<Switch />}
      >
        Zone
      </ListHeader>
    ),
  },
} satisfies Story;
