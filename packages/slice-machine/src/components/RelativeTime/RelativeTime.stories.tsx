import type { Meta, StoryObj } from "@storybook/react";

import { RelativeTime } from "./RelativeTime";

type Story = StoryObj<typeof meta>;

const meta = {
  component: RelativeTime,
  argTypes: {
    date: { control: "date" },
  },
} satisfies Meta<typeof RelativeTime>;

export default meta;

export const Default = {
  args: {
    date: new Date("1 Jan 2024"),
  },
  render: ({ date, ...otherArgs }) => (
    // The `date` control converts the `date` arg into a UNIX timestamp. That's
    // why we need to convert it back into a `Date` object.
    <RelativeTime {...otherArgs} date={new Date(date)} />
  ),
} satisfies Story;
