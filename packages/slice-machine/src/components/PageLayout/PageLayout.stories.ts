import type { Meta, StoryObj } from "@storybook/react";

import { PageLayout } from "./PageLayout";

type Story = StoryObj<typeof meta>;

const meta = {
  title: "Slice Machine UI/PageLayout",
  component: PageLayout,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof PageLayout>;

export default meta;

export const Default: Story = {};
