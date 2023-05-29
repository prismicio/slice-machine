import type { Meta, StoryObj } from "@storybook/react";

import { Breadcrumb } from "./Breadcrumb";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;

export default meta;

export const Default = {
  args: {
    children: "My Page",
  },
} satisfies Story;
