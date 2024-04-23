import { Button } from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { BaseHoverCard } from "./BaseHoverCard";

type Story = StoryObj<typeof meta>;

const meta = {
  component: BaseHoverCard,
  argTypes: {
    children: { control: { disable: true } },
    trigger: { control: { disable: true } },
  },
} satisfies Meta<typeof BaseHoverCard>;

export default meta;

export const Default = {
  args: {
    trigger: <Button>Create</Button>,
    children: <p>My Hover Card Content</p>,
  },
} satisfies Story;
