import type { Meta, StoryObj } from "@storybook/react";

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutHeader,
  PageLayoutPane,
} from "./PageLayout";
import { borderTop } from "./PageLayout.css";

type Story = StoryObj<typeof meta>;

const meta = {
  component: PageLayout,
  argTypes: {
    children: {
      control: { disable: true },
    },
    variant: {
      control: { type: "select" },
      options: Object.keys(borderTop),
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
    children: (
      <>
        <PageLayoutPane />
        <PageLayoutHeader />
        <PageLayoutContent />
      </>
    ),
  },
} satisfies Story;
