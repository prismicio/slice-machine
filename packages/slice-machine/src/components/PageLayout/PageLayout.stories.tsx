import type { Meta, StoryObj } from "@storybook/react";

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutHeader,
  PageLayoutPane,
} from "./PageLayout";
import { borderTopColor } from "./PageLayout.css";

type Story = StoryObj<typeof meta>;

const meta = {
  component: PageLayout,
  argTypes: {
    children: {
      control: { disable: true },
    },
    borderTopColor: {
      control: { type: "select" },
      options: [...Object.keys(borderTopColor), undefined],
    },
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
