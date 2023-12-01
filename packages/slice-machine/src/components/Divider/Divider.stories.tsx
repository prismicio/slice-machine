import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "@prismicio/editor-ui";

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
    color: {
      control: { type: "select" },
      options: Object.keys(colors),
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;

export const Default = {
  args: {
    variant: "dashed",
    color: "currentColor",
  },
} satisfies Story;
