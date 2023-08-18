import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@prismicio/editor-ui";

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
      <>
        <ListHeader>Static Zone • 00</ListHeader>
        <ListHeader actions={<Button endIcon="add">Add</Button>}>
          Slices • 00
        </ListHeader>
      </>
    ),
  },
} satisfies Story;
