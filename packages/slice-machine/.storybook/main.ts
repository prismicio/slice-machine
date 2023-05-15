import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-essentials"],
  docs: { autodocs: "tag" },
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.ts?(x)"],
};

export default config;
