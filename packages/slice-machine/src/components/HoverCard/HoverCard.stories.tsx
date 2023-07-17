import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@prismicio/editor-ui";

import { HoverCard } from "./HoverCard";

type Story = StoryObj<typeof meta>;

const meta = {
  component: HoverCard,
  argTypes: {
    anchor: { control: { disable: true } },
    children: { control: { disable: true } },
  },
} satisfies Meta<typeof HoverCard>;

export default meta;

export const Default = {
  args: {
    anchor: <Button>Create</Button>,
    children: <p>My Hover Card Content</p>,
  },
} satisfies Story;
