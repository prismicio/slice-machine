import { Text } from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { Icon } from "./Icon";
import { iconNames } from "./iconNames";

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof Icon> = {
  title: "Slice Machine UI/Icon",
  component: Icon,
  tags: ["autodocs"],
  render: () => (
    <>
      {iconNames.map((name) => (
        <div
          key={name}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 8,
            minWidth: 60,
            gap: 8,
            border: "1px dotted #DDD",
            borderRadius: 4,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Icon name={name} />
          <Text>{name}</Text>
        </div>
      ))}
    </>
  ),
};

export default meta;

export const Default: Story = {};
