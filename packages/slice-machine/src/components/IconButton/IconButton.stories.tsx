import type { Meta, StoryObj } from "@storybook/react";

import { iconNames } from "../Icon/iconNames";
import { IconButton } from "./IconButton";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof IconButton> = {
  title: "Slice Machine UI/IconButton",
  component: IconButton,
  argTypes: {
    icon: {
      control: { type: "select" },
      options: iconNames,
    },
    onClick: {},
  },
  render: (args) => <IconButton {...args} />,
};

export default meta;

export const Default: Story = {
  args: {
    icon: "fieldList",
  },
};
