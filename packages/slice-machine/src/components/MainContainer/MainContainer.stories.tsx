import type { Meta, StoryObj } from "@storybook/react";

import { MainContainer, MainContainerHeader } from "./";
import { Button } from "@prismicio/editor-ui";

type Story = StoryObj<typeof meta>;

const meta = {
  component: MainContainer,
  parameters: {
    docs: { story: { height: 256 * 2, inline: false } },
    layout: "fullscreen",
  },
} satisfies Meta<typeof MainContainer>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <MainContainerHeader
          backTo={() => console.log("back to")}
          breadcrumb="folder/file"
          Actions={[
            <Button key="action-1">Action 1</Button>,
            <Button key="action-2">Action 2</Button>,
          ]}
        />
        <div>Main Content</div>
      </>
    ),
  },
} satisfies Story;
