import "@prismicio/editor-ui/style.css";

import { ThemeProvider, TooltipProvider } from "@prismicio/editor-ui";
import type { Preview } from "@storybook/react";

const preview: Preview = {
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
      exclude: ["className", "style"],
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
