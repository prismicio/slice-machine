import type { Meta, StoryObj } from "@storybook/react";

import { iconNames } from "../Icon/iconNames";
import { IconButton } from "./IconButton";

type Story = StoryObj<typeof meta>;

const meta = {
  component: IconButton,
  argTypes: {
    icon: {
      control: { type: "select" },
      options: iconNames,
    },
    onClick: {},
  },
  render: (args) => <IconButton {...args} />,
} satisfies Meta<typeof IconButton>;

export default meta;

export const Default = {
  args: {
    icon: "fieldList",
  },
} satisfies Story;
