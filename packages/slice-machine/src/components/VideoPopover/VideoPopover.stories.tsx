import type { Meta, StoryObj } from "@storybook/react";
import { VideoPopover, VideoContainer } from "./VideoPopover";

const meta = {
  component: VideoPopover,
  parameters: { layout: "fullscreen" },
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof VideoPopover>;

type Story = StoryObj<typeof meta>;

export default meta;

const noop = () => void 0;

export const Default = {
  args: {
    open: true,
    onClose: noop,
    onPlay: noop,
    children: (
      <button style={{ position: "absolute", left: "20px", bottom: "20px" }}>
        Popover
      </button>
    ),
  },
} satisfies Story;

export const VideoPlayer = {
  render: () => <VideoContainer onClose={noop} onPlay={noop} />,
};
