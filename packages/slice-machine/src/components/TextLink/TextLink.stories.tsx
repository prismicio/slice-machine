import type { Meta, StoryObj } from "@storybook/react";

import { TextLink } from "./TextLink";

type Story = StoryObj<typeof meta>;

const meta = {
  component: TextLink,
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
