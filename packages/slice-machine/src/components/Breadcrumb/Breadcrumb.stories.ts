import type { Meta, StoryObj } from "@storybook/react";

import { Breadcrumb } from "./Breadcrumb";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;

export default meta;

export const Default = {
  args: {
    folder: "folder",
    page: "page",
  },
} satisfies Story;

export const FolderOnly = {
  args: {
    folder: "folder",
  },
} satisfies Story;

export const CustomSeparator = {
  args: {
    folder: "folder",
    page: "page",
    separator: ">",
  },
} satisfies Story;
