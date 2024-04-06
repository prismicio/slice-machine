import type { Meta, StoryObj } from "@storybook/react";

import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  argTypes: {
    children: { control: { disable: true } },
  },
};

export default meta;

export const Default = {
  args: {
    children: [
      <BreadcrumbItem>Foo</BreadcrumbItem>,
      <BreadcrumbItem>Bar</BreadcrumbItem>,
      <BreadcrumbItem>Baz</BreadcrumbItem>,
    ],
  },
} satisfies Story;

export const WithActiveItem = {
  args: {
    children: [
      <BreadcrumbItem>Foo</BreadcrumbItem>,
      <BreadcrumbItem>Bar</BreadcrumbItem>,
      <BreadcrumbItem active>Baz</BreadcrumbItem>,
    ],
  },
} satisfies Story;
