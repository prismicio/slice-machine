import type { Meta, StoryObj } from "@storybook/react";

import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  argTypes: {
    activeItem: { control: { disable: true } },
    children: { control: { disable: true } },
  },
};

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <BreadcrumbItem>Foo</BreadcrumbItem>
        <BreadcrumbItem>Bar</BreadcrumbItem>
        <BreadcrumbItem>Baz</BreadcrumbItem>
      </>
    ),
  },
} satisfies Story;

export const WithActiveItem = {
  args: {
    activeItem: <BreadcrumbItem>Baz</BreadcrumbItem>,
    children: (
      <>
        <BreadcrumbItem>Foo</BreadcrumbItem>
        <BreadcrumbItem>Bar</BreadcrumbItem>
      </>
    ),
  },
} satisfies Story;
