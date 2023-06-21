import type { Meta, StoryObj } from "@storybook/react";

import { TextLink } from "./TextLink";
import { Icon } from "@prismicio/editor-ui";

type Story = StoryObj<typeof meta>;

const meta = {
  component: TextLink,
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "secondary"],
    },
    endIcon: { control: { disable: true } },
    textVariant: {
      control: { type: "select" },
      options: ["normal", "smallBold", "inherit"],
    },
  },
} satisfies Meta<typeof TextLink>;

export default meta;

export const Default = {
  args: {
    children: "Default",
    href: "#",
  },
} satisfies Story;

export const Variant = {
  args: {
    children: "Variant",
    href: "#",
    color: "secondary",
    textVariant: "normal",
  },
} satisfies Story;

export const EndIcon = {
  args: {
    children: "Add something",
    href: "#",
    endIcon: <Icon name="add" />,
  },
} satisfies Story;
