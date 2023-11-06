import type { Meta, StoryObj } from "@storybook/react";
import {
  HoverCard,
  HoverCardDescription,
  HoverCardCloseButton,
  HoverCardMedia,
  HoverCardTitle,
} from "./HoverCard";
import { Button } from "@prismicio/editor-ui";

const meta = {
  component: HoverCard,
  argTypes: {
    children: { control: { disable: true } },
    trigger: { control: { disable: true } },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HoverCard>;

type Story = StoryObj<typeof meta>;

export default meta;

const noop = () => void 0;

export const Image = {
  args: {
    open: true,
    onClose: noop,
    openDelay: 1500,
    trigger: <Button>HoverCard</Button>,
    children: (
      <>
        <HoverCardTitle>Prismic Academy©</HoverCardTitle>
        <HoverCardMedia component="image" src="phil.png" />
        <HoverCardDescription>
          Lorem ipsum dolor sit amet consectetur. Aenean purus aliquam vel eget
          vitae etiam
        </HoverCardDescription>
        <HoverCardCloseButton>Got It</HoverCardCloseButton>
      </>
    ),
  },
} satisfies Story;

export const Video = {
  args: {
    open: true,
    onClose: noop,
    openDelay: 1500,
    trigger: <Button>HoverCard</Button>,
    children: (
      <>
        <HoverCardTitle>Prismic Academy©</HoverCardTitle>
        <HoverCardMedia
          component="video"
          cloudName="dmtf1daqp"
          publicId="Tooltips/pa-course-overview_eaopsn"
          poster="prismic-academy-101.png"
        />
        <HoverCardDescription>
          Lorem ipsum dolor sit amet consectetur. Aenean purus aliquam vel eget
          vitae etiam
        </HoverCardDescription>
        <HoverCardCloseButton>Got It</HoverCardCloseButton>
      </>
    ),
  },
} satisfies Story;
