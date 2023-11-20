import type { Meta, StoryObj } from "@storybook/react";

import { Counter } from "./Counter";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Counter,
} satisfies Meta<typeof Counter>;

export default meta;

export const Default = {
  args: {
    children: "1",
  },
} satisfies Story;
