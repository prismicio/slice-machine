import type { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "./IconButton";
import * as styles from "./IconButton.css";
import { JavaScript } from "@src/icons/JavaScript";

const meta: Meta<typeof IconButton> = {
  component: IconButton,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  argTypes: {
    size: {
      control: { type: "select" },
      options: Object.keys(styles.size),
    },
    cursor: {
      control: { type: "select" },
      options: Object.keys(styles.cursor),
    },
    onClick: {},
  },
  args: {
    cursor: "pointer",
    loading: false,
    hasPadding: true,
    size: "medium",
    children: <JavaScript />,
  },
};
