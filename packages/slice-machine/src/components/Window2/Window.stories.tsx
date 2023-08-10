import type { Meta, StoryObj } from "@storybook/react";

import {
  Window,
  WindowFrame,
  WindowTabs,
  WindowTabsContent,
  WindowTabsList,
  WindowTabsTrigger,
} from "./Window";

type Story = StoryObj<typeof meta>;

const meta = {
  title: "Window2",
  component: Window,
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof Window>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <WindowFrame />
        <WindowTabs>
          <WindowTabsList>
            <WindowTabsTrigger>Main</WindowTabsTrigger>
            <WindowTabsTrigger>SEO</WindowTabsTrigger>
          </WindowTabsList>
          <WindowTabsContent>Main</WindowTabsContent>
          <WindowTabsContent>SEO</WindowTabsContent>
        </WindowTabs>
      </>
    ),
  },
} satisfies Story;
