import { theme } from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { Divider } from "./Divider";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Divider,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["dashed", "edgeFaded"],
    },
    color: {
      control: { type: "select" },
      options: Object.keys(theme.color),
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
