import type { Meta, StoryObj } from "@storybook/react";

import { MainContainer, MainContainerHeader, MainContainerContent } from "./";
import { Button } from "@prismicio/editor-ui";

type Story = StoryObj<typeof meta>;

const meta = {
  component: MainContainer,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof MainContainer>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <MainContainerHeader
          backTo={() => console.log("back to")}
          breadcrumb="folder/file"
          actions={
            <>
              <Button>Action 1</Button>
              <Button>Action 2</Button>
            </>
          }
        />
        <MainContainerContent>Main Content</MainContainerContent>
      </>
    ),
  },
} satisfies Story;
