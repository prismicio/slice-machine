import type { Meta, StoryObj } from "@storybook/react";
import { Button, Image } from "@prismicio/editor-ui";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "./BlankSlate";

type Story = StoryObj<typeof meta>;

const meta = {
  component: BlankSlate,
} satisfies Meta<typeof BlankSlate>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <BlankSlateImage>
          <Image src="/blank-slate-page-types.png" sizing="cover" />
        </BlankSlateImage>
        <BlankSlateContent>
          <BlankSlateTitle>My blank slate title</BlankSlateTitle>
          <BlankSlateDescription>
            My blank slate description
          </BlankSlateDescription>
          <BlankSlateActions>
            <Button size="medium">Create</Button>
          </BlankSlateActions>
        </BlankSlateContent>
      </>
    ),
  },
} satisfies Story;
