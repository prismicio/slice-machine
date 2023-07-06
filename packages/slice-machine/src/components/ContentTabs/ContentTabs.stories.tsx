import type { Meta, StoryObj } from "@storybook/react";

import { ContentTabs } from "./";

type Story = StoryObj<typeof meta>;

const meta = {
  component: ContentTabs,
  argTypes: { tabs: { control: { disable: true } } },
} satisfies Meta<typeof ContentTabs>;

export default meta;

export const Default = {
  args: {
    tabs: [
      {
        label: "Tab 1",
        content: <>Tab 1</>,
      },
      {
        label: "Tab 2",
        content: <>Tab 2</>,
      },
    ],
  },
} satisfies Story;
