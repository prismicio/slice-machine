import type { Meta, StoryObj } from "@storybook/react";

import { Divider } from "./Divider";
import { variants } from "./Divider.css";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Divider,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: Object.keys(variants),
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;

export const Default = {
  args: {},
} satisfies Story;
