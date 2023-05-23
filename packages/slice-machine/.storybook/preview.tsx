import { ThemeProvider } from "@prismicio/editor-ui";
import "@prismicio/editor-ui/style.css";
import type { Preview } from "@storybook/react";

const preview: Preview = {
  argTypes: { className: { control: { disable: true } } },
  decorators: [
    (Story) => (
      <ThemeProvider mode="light">
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      sort: "alpha",
    },
    options: { storySort: { method: "alphabetical" } },
  },
};

export default preview;
