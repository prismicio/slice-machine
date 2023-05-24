import type { Meta, StoryObj } from "@storybook/react";

import { PageLayout } from "./PageLayout";

type Story = StoryObj<typeof meta>;

const meta = {
  component: PageLayout,
  parameters: {
    docs: { story: { height: 256, inline: false } },
    layout: "fullscreen",
  },
} satisfies Meta<typeof PageLayout>;

export default meta;

export const Default = {} satisfies Story;
