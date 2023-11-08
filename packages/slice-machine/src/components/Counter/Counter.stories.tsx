import type { Meta, StoryObj } from "@storybook/react";

import { FlowerBackgroundIcon } from "@src/icons/FlowerBackgroundIcon";

import { Counter } from "./Counter";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Counter,
  argTypes: {
    backgroundIcon: { control: { disable: true } },
    children: { control: { disable: true } },
  },
} satisfies Meta<typeof Counter>;

export default meta;

export const Default = {
  args: {
    backgroundIcon: <FlowerBackgroundIcon />,
    children: 1,
  },
} satisfies Story;
