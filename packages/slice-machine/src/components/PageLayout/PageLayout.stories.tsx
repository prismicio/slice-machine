import type { Meta, StoryObj } from "@storybook/react";

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutHeader,
  PageLayoutPane,
} from "./PageLayout";

type Story = StoryObj<typeof meta>;

const meta = {
  component: PageLayout,
  argTypes: {
    borderTopColor: {
      control: "select",
      options: ["amber", "indigo", "purple"],
    },
    children: { control: { disable: true } },
  },
  parameters: {
    docs: { story: { height: 256, inline: false } },
    layout: "fullscreen",
  },
} satisfies Meta<typeof PageLayout>;

export default meta;

export const Default = {
  args: {
    borderTopColor: "purple",
    children: (
      <>
        <PageLayoutPane />
        <PageLayoutHeader />
        <PageLayoutContent />
      </>
    ),
  },
} satisfies Story;
