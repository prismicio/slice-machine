import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-essentials"],
  core: { disableTelemetry: true },
  docs: { autodocs: true },
  framework: "@storybook/react-vite",
  stories: [
    {
      directory: "../src/components",
      files: "**/*.stories.ts?(x)",
      titlePrefix: "Slice Machine UI",
    },
  ],
};

export default config;
