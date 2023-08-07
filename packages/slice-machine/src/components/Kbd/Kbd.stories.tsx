import type { Meta, StoryObj } from "@storybook/react";

import { Kbd } from "./Kbd";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Kbd,
} satisfies Meta<typeof Kbd>;

export default meta;

export const Default = {
  args: {
    children: "cmd",
  },
} satisfies Story;
