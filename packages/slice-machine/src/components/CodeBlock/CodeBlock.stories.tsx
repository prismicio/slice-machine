import type { Meta, StoryObj } from "@storybook/react";

import { CodeBlock } from "./";

type Story = StoryObj<typeof meta>;

const meta = {
  component: CodeBlock,
  argTypes: {
    className: {
      control: { type: "select" },
      options: ["language-typescript", "language-javascript", "language-vue"],
    },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;

export const Default = {
  args: {
    copy: true,
    fileInfo: {
      fileName: "app/index.tsx",
    },
    className: "language-typescript",
    code: ["const a = true;\nconst b = !a;"],
  },
} satisfies Story;

export const WithoutCopy = {
  args: {
    copy: false,
    fileInfo: {
      fileName: "app/index.js",
    },
    className: "language-typescript",
    code: ["const c = 'true'"],
  },
} satisfies Story;
