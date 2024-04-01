import type { Meta, StoryObj } from "@storybook/react";

import { Count } from "./Count";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Count,
} satisfies Meta<typeof Count>;

export default meta;

export const Default = {
  args: {
    children: "1",
  },
} satisfies Story;
