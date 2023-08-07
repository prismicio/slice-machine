import { ThemeProvider, TooltipProvider } from "@prismicio/editor-ui";
import "@prismicio/editor-ui/style.css";
import type { Preview } from "@storybook/react";

const preview: Preview = {
  argTypes: {
    children: { control: { disable: true } },
    className: { control: { disable: true } },
    style: { control: { disable: true } },
  },
  decorators: [
    (Story) => (
      <ThemeProvider mode="light">
        <TooltipProvider>
          <Story />
        </TooltipProvider>
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
