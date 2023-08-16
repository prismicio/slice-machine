import { DropdownMenuItem } from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import {
  Window,
  WindowFrame,
  WindowTabs,
  WindowTabsContent,
  WindowTabsList,
  WindowTabsTrigger,
} from "./Window";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Window,
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof Window>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <WindowFrame />
        <WindowTabs defaultValue="tab-0">
          <WindowTabsList>
            <WindowTabsTrigger
              menu={<DropdownMenuItem>Item</DropdownMenuItem>}
              value="tab-0"
            >
              Tab 1
            </WindowTabsTrigger>
            <WindowTabsTrigger
              menu={<DropdownMenuItem>Item</DropdownMenuItem>}
              value="tab-1"
            >
              Tab 2
            </WindowTabsTrigger>
          </WindowTabsList>
          <WindowTabsContent value="tab-0">Tab 1</WindowTabsContent>
          <WindowTabsContent value="tab-1">Tab 2</WindowTabsContent>
        </WindowTabs>
      </>
    ),
    style: { boxSizing: "border-box", height: "256px" },
  },
} satisfies Story;

export const WithListOverflow = {
  args: {
    ...Default.args,
    children: (
      <>
        <WindowFrame />
        <WindowTabs defaultValue="tab-0">
          <WindowTabsList>
            {[...Array(100).keys()].map((index) => (
              <WindowTabsTrigger
                key={index}
                menu={<DropdownMenuItem>Item</DropdownMenuItem>}
                value={`tab-${index}`}
              >
                Tab {index + 1}
              </WindowTabsTrigger>
            ))}
          </WindowTabsList>
          {[...Array(100).keys()].map((index) => (
            <WindowTabsContent key={index} value={`tab-${index}`}>
              Tab {index + 1}
            </WindowTabsContent>
          ))}
        </WindowTabs>
      </>
    ),
  },
} satisfies Story;

export const WithTriggerOverflow = {
  args: {
    ...Default.args,
    children: (
      <>
        <WindowFrame />
        <WindowTabs defaultValue="tab-0">
          <WindowTabsList>
            <WindowTabsTrigger
              menu={<DropdownMenuItem>Item</DropdownMenuItem>}
              value="tab-0"
            >
              Tab 1
            </WindowTabsTrigger>
            <WindowTabsTrigger
              menu={<DropdownMenuItem>Item</DropdownMenuItem>}
              value="lorem-ipsum"
            >
              Lorem ipsum dolor sit amet, consectetur.
            </WindowTabsTrigger>
          </WindowTabsList>
          <WindowTabsContent value="tab-0">Tab 1</WindowTabsContent>
          <WindowTabsContent value="lorem-ipsum">
            Lorem ipsum dolor sit amet, consectetur.
          </WindowTabsContent>
        </WindowTabs>
      </>
    ),
  },
} satisfies Story;

export const WithoutFrame = {
  args: {
    ...Default.args,
    children: (
      <WindowTabs defaultValue="tab-0">
        <WindowTabsList>
          <WindowTabsTrigger
            menu={<DropdownMenuItem>Item</DropdownMenuItem>}
            value="tab-0"
          >
            Tab 1
          </WindowTabsTrigger>
          <WindowTabsTrigger
            menu={<DropdownMenuItem>Item</DropdownMenuItem>}
            value="tab-1"
          >
            Tab 2
          </WindowTabsTrigger>
        </WindowTabsList>
        <WindowTabsContent value="tab-0">Tab 1</WindowTabsContent>
        <WindowTabsContent value="tab-1">Tab 2</WindowTabsContent>
      </WindowTabs>
    ),
  },
} satisfies Story;
